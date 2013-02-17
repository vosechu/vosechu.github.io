---
layout: post
categories: tech
title: Recursively load nodes from a rich data model
tags: drupal, rich data model, recursive node_load
typo_id: 298
---
Cross posted on the "Metal Toad Blog":http://metaltoad.com/blog/recursively-load-nodes-rich-data-model

If you've ever worked with a rich data model in drupal you know it can be a pain
to load up all the children and parents of a node within the templating engine.
One method that could save you a lot of time is to load the data recursively
in node_load and save your poor front-end guy some wrist pain (or yourself if you're
that guy!)

Edit: Please look at the get_metadata() definition towards the bottom or none of this is going to make sense.

Here is the initial bit which loads on details about a node. Here of course you
could load all manner of things like read/write attributes, cck fields, etc.

{% highlight php %}
<?php
/**
 * Implementation of hook_load().
 */
function wrapper_load($node) {
  $metadata = get_metadata($node);

  // Load our attributes without children. We'll load children later.
  $node = wrapper_load_without_friends($node);

{% endhighlight %}

One thing we found was that search would break when trying to index since it was
trying to load all the data from associated nodes as well. One way of dealing with
this is to use hook_nodeapi('update index') to only load a subset of data instead
of the whole shebang. But I didn't do it like that and I'm not going to put untested
code on the blog (well, aside from slightly edited code).

This is what I did instead. It's interesting for its hackishness. There must be a
better way though.

{% highlight php %}
<?php
  $backtrace = debug_backtrace();
  if ($backtrace[4]['function'] == 'node_update_index') {
    return $node;
  }

{% endhighlight %}

Here we get to the fun part though. This bit loads up the parents, those that this
node belongs to. Due to performance constraints when doing this you need to pick
a direction to load infinitely. If you choose to load parents recursively you have
easier code and it's actually a lot faster as far as SQL is concerned. If you choose
to load children recursively, as I will do in a moment, the SQL is a little slower
but on-the-fly SQL is easier to write for a belongs_to relationship. When all the
data necessary is already in the db row you load to build yourself it's easy to
include your parents too.

So you'll note that here we load up a collection of parents being careful to make
sure that the recursive function knows who called it by the parent attribute on $obj.

{% highlight php %}
<?php
  // Load up any parents
  if ($metadata['belongs_to']) {
    foreach ($metadata['belongs_to'] as $drupal_attr => $legacy_attr) {
      // When we load up a child it shouldn't load its parents
      if ($node->parent != $drupal_attr) {
        $node->{$drupal_attr."_collection"} = array();

        // Get all the node attributes for our new object
        $obj = db_fetch_object(db_query(
          "SELECT * FROM %s as extra WHERE node.nid = %s",
          $node->$drupal_attr
        ));

        // This ensures that a child doesn't reverse and load its parent in the
        // next call
        $obj->parent = $node->type;

        // Push our recursively loaded object into the empty collection. Here we
        // choose to only load one level but you could use hook_load again to load
        // deeper structures. The parent attribute should prevent us from getting
        // into loops.
        array_push(
          $node->{$drupal_attr."_collection"},
          wrapper_load_without_friends($obj)
        );
      }
    }
  }

{% endhighlight %}

Very similarly, here we load up the children. This time we load recursively with
no end condition. This is prone to cycles so you may have to go with a non-recursive
loader here if you have a cyclic loading cycle or some other way of terminating
the recursion.

{% highlight php %}
<?php
  // Load any children
  if ($metadata['has_many'] && $node->nid) {
    foreach ($metadata['has_many'] as $drupal_attr => $legacy_attr) {
      // Bail out if this node has a parent at all. We just want to keep it
      // simple for now.
      if (!$node->parent) {
        // Get the list of things this object owns
        $res = db_query(
          "SELECT * FROM $drupal_attr as extra WHERE extra.%s = %s",
          $node->type,
          $node->nid
        );

        // node_load all children and drop them in an array
        $node->{$drupal_attr."_collection"} = array();
        while ($obj = db_fetch_object($res)) {

          // Once again, prevent our children from loading us and creating loops.
          $obj->parent = $node->type;

          // Push our recursively loaded children and their children onto the empty
          // collection. This time we go all the way and create a much deeper data
          // model. These two could be reversed, loading belongs_to indefinitely
          // but I find this way easier.
          array_push($node->{$drupal_attr."_collection"}, wrapper_load($obj));
        }
      }
    }
  }

  return $node;
}

{% endhighlight %}

Here's where we load extra attributes from the node addon table that you see associated
with every custom content-type. These attributes just get added onto the node directly
so there is some concern about columns named with php reserved words. Conflicting
column names like title just need to be carefully considered, they may not actually
be bad a bad idea.

{% highlight php %}
<?php
// Hook load that doesn't recursively load children/parents, just the attributes
// of another table
function wrapper_load_without_friends($node) {
  $metadata = get_metadata($node);

  // Load up extra info from the node addon table
  if ($node->nid) {
    $extra_attributes = db_fetch_object(db_query(
      "SELECT * FROM %s WHERE nid = %s",
      $node->type, $node->nid)
    );

    // Foreach of the linking attributes which will allow us to find children
    // load them onto the node directly.
    foreach ($extra_attributes as $key => $value) {
      $node->$key = $value;
    }
  }

  return $node;
}

{% endhighlight %}

This is just a sample of our metadata loader. Naturally you could do this some other
way but it works pretty well for us. There is room for improvement though, using
a different format like YAML could buy some extra win for instance.

{% highlight php %}
<?php
// Sample metadata describing has_many and belongs_to relationships as well as
// the read/write attributes each table has.
function get_metadata($node=NULL) {
  $metadata = array(
    'belongs_to' => array(
      'staff' => array(
        'office' => 'office_id',
      )
    ),
    'has_many' => array(
      'office' => array(
        'staff' => 'office_id',
      )
    ),
  );

  $return['belongs_to'] = $metadata['belongs_to'][$node->type];
  $return['has_many'] = $metadata['has_many'][$node->type];

  return $return;
}

{% endhighlight %}
