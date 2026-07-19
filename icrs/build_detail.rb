#!/usr/bin/env ruby
# frozen_string_literal: true

# Generate detail.json: a per-row talk-level byline map for the click-to-expand
# panels. Keyed by the page's data-row id (e.g. "cs-mon-001"); each value is the
# session's talks in running order:
#
#   { st: startTime, t: title, p: presenter, a: [authors], af: [affiliations] }
#
# The page fetches detail.json after load and caches it (Cache Storage API), so
# this file is COMMITTED and deployed (unlike the raw, gitignored presenters.json).
#
# Pipeline:  fetch_programme.rb -> presenters.json -> build_detail.rb -> detail.json
# Rerun whenever presenters.json or the index.html session rows change:
#
#   ruby build_detail.rb

require 'json'

DIR = __dir__
data = JSON.parse(File.read(File.join(DIR, 'presenters.json')))
html = File.read(File.join(DIR, 'index.html'))

def norm_room(room)
  room.to_s.downcase.sub(/\btheatre\b/, '').strip
end

# Scrub what leaks in from free-text API fields before publishing to a public
# repo: stray email addresses (someone typed one into an affiliation) and
# invisible Unicode (zero-width space/joiners, word joiner, BOM, soft hyphen).
EMAIL = /[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}/
INVISIBLE = /[\u{200B}-\u{200D}\u{2060}\u{FEFF}\u{00AD}]/

def clean(str)
  return str unless str.is_a?(String)

  str.gsub(EMAIL, '').gsub(INVISIBLE, '').gsub(/\s{2,}/, ' ').strip
end

# JSON index: (sessionNumber|date|room|startTime) -> session
index = {}
data['sessions'].each do |s|
  next unless s['sessionNumber']

  key = [s['sessionNumber'].to_s, s['date'], norm_room(s['room']), s['startTime']].join('|')
  index[key] = s
end

DATE = { 'mon20' => '2026-07-20', 'tue21' => '2026-07-21', 'wed22' => '2026-07-22',
         'thu23' => '2026-07-23', 'fri24' => '2026-07-24' }.freeze
# slot-time label (ASCII-dash normalized) -> JSON startTime of that slot
STIME = {
  '10:15-11:45am' => '10:15 AM', '2-3:30pm' => '2:00 PM', '4-5:30pm' => '4:00 PM',
  '9:45-11:15am' => '9:45 AM', '11:20am-12:20pm' => '11:20 AM', '2:30-4pm' => '2:30 PM', '4:30-6pm' => '4:30 PM',
  '8:30-10am' => '8:30 AM', '10:30am-12pm' => '10:30 AM'
}.freeze

cur_date = nil
cur_stime = nil
detail = {}
missed = []
talk_total = 0

html.each_line do |ln|
  if (m = ln[/data-day="([a-z0-9]+)"/, 1])
    cur_date = DATE[m]
    cur_stime = nil
  end
  if (t = ln[%r{<div class="slot-time"><span>([^<]*)</span>}, 1])
    cur_stime = STIME[t.gsub(/[–—-]/, '-')]
  end
  next unless (rowid = ln[/data-row="(cs-[a-z]+-\d+)"/, 1])

  num = ln[/#(\d+)/, 1]
  room = ln[%r{<div class="label"><b>([^<]+)</b>}, 1]
  key = [num, cur_date, norm_room(room), cur_stime].join('|')
  s = index[key]
  if s.nil?
    missed << [rowid, key]
    next
  end
  talks = Array(s['presentations']).map do |p|
    { 'st' => p['startTime'], 't' => clean(p['title']), 'p' => clean(p['presenter']),
      'a' => Array(p['authors']).map { |x| clean(x) }.reject { |x| x.to_s.empty? },
      'af' => Array(p['affiliations']).map { |x| clean(x) }.reject { |x| x.to_s.empty? } }
  end
  talk_total += talks.length
  detail[rowid] = talks
end

warn "rows matched: #{detail.size} / 223, missed: #{missed.length}"
missed.first(8).each { |r, k| warn "  MISS #{r} key=#{k}" }
abort 'not all rows matched — refusing to write a partial detail.json' unless detail.size == 223 && missed.empty?

out = File.join(DIR, 'detail.json')
File.write(out, JSON.generate(detail))
kb = (File.size(out) / 1024.0).round
warn "wrote detail.json: #{detail.size} sessions, #{talk_total} talks, #{File.size(out)} bytes (#{kb} KB)"
