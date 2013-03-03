---
layout: page
---
# Frontend and Javascript

***

{% include confidence.md %}
Q: What is the difference between padding and margin?

* A: Mostly spelling, they do the same thing.
* B: Padding collapses when it gets near another element with padding.
* C: Margin is only used on the sides and top of the window.
* D: Padding is inside the border, margin is outside.

***

{% include confidence.md %}
Q: Why should you use a css reset like Normalize?

* A: To prevent browser manufacturers from breaking our site when users upgrade.
* B: Because all browsers are slightly different and normalize gives us a nice base.
* C: It allows us to nest CSS and use variables.
* D: Because it makes all our colors match nicely.

***

{% include confidence.md %}
Q: How are css selectors weighted?

* A: attribute: 5, class: 20, id: 50
* B: element: 1, class: 10, id: 100
* C: id: 1, class: 10, element: 100
* D: p: 1, div: 10, html: 100

***

{% include confidence.md %}
Q: Why do we often place an id on the body which is different for each page?

* A: So that we can scope our CSS and javascript to a particular page
* B: To ensure that our javascript can't load up other pages
* C: We don't, Chuck it's a performance problem.
* D: We don't, we can't put id's on the body element.

***

{% include confidence.md %}
Q: When you've `float: left`ed several block-level items, how do we prevent the following text from wrapping up on the right side?

* A: By using the property, `clear: both`.
* B: By using, `float: right` on the last item.
* C: By putting the items inside a section or nav tag.
* D: By using a "clearfix" div wrapped around all the floated elements

***

{% include confidence.md %}
Q: What happens if we declare several empty items as `inline-block`?

* A: Their height disappears and they collapse into each other.
* B: They will act like inline elements and flow around each other but will still have a height/width.
* C: They will stack on top of each other even if they're inline elements normally
* D: They will center on the page in a vertical line.

***

{% include confidence.md %}
Q: What's the best way to center content horizontally as opposed to text?

* A: `text-align: center`
* B: `margin: auto`
* C: `padding: -1`
* D: `margin: 0 auto`

***

{% include confidence.md %}
Q: How do you detect an undefined variable (a) in javascript safely?

* A: `a.nil?`
* B: `typeof a === 'undefined'`
* C: `a == null`
* D: `a === undefined`

***

{% include confidence.md %}
Q: If you declare a variable inside a function is it available outside that function?

* A: No. It exists only inside the function.
* B: Not unless you declare it globally like: `var global <name>`.
* C: Yes. It will get placed on the window regardless of where you declare it.
* D: Yes. But it will be undefined outside of the function.

***

{% include confidence.md %}
Q: If you declare a variable (`var a`) outside a function, but then declare it inside (`var a`), what happens?

* A: Any assignment to `a` will be copied to the outside variable. It will override.
* B: Any assignment to `a` will be hoisted out of the function.
* C: We will get a DuplicateVariableError.
* D: Any assignment to `a` inside the function will be lost after the function returns. It will shadow.

***

{% include confidence.md %}
Q: If a variable is defined at the end of a function, can we still use it in the beginning?

* A: No, it only exists after the `var`.
* B: Yes. The definition will be hoisted to the top of the function.
* C: Yes, but it will be overridden and lost when it's declared.
* D: No, it will throw a ReferenceError.

***

{% include confidence.md %}
Q: If you only need to GET data, what's the easiest way to request it from another domain via AJAX?

* A: Just request directly.
* B: Using CORS and a Polyfill for old browsers.
* C: Using JSON-P.
* D: Using Ruby's net/http or httparty.

***

### Short Answer

{% include confidence.md %}
Q: Draw out 4 diagrams that show 4 divs that are: `display: inline`, `display: block`, `display: inline-block`, and `float: left`

A:
<p>&nbsp;</p>
<p>&nbsp;</p>

***

{% include confidence.md %}
Q: When using a vendor-prefixed CSS style, why should the generic prefix come last?

A:
<p>&nbsp;</p>
<p>&nbsp;</p>

***

{% include confidence.md %}
Q: Chuck often talks about having 3 CSS files, what are the purposes of these three files: reset.css, global.css, pages.css?

A:
<p>&nbsp;</p>
<p>&nbsp;</p>

***

{% include confidence.md %}
Q: What does it mean to delay javascript until domReady? And how do you do that in jQuery?

A:
<p>&nbsp;</p>
<p>&nbsp;</p>
