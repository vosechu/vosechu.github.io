# frozen_string_literal: true

# Fetches the ICRS 2026 programme from EventsAir's public API and (re)builds
# presenters.json — the full byline (presenter + every co-author) per session,
# which index.html consumes. Re-run whenever the programme changes:
#
#   ruby fetch_programme.rb
#
# The API is public (no auth). See CLAUDE.md in this directory for endpoint
# notes and the gotcha that keeps presentations empty. Raw feeds are cached
# under .data/ (gitignored) for ad-hoc jq queries.

require 'json'
require 'net/http'
require 'uri'
require 'fileutils'

BASE = 'https://websitegatewayae.eventsair.com/api'
QUERY = 'tenant=innovators&projectid=23820057'
DIR = __dir__
CACHE = File.join(DIR, '.data')

HEADERS = {
  'Content-Type' => 'application/json',
  'Origin' => 'https://innovators-icrs2026programme.eventsairsite.com',
  'Referer' => 'https://innovators-icrs2026programme.eventsairsite.com/'
}.freeze

# statusIds that put a paper on the programme; without them GetAgendaData
# returns sessions with empty presentation lists. Accepted oral/speed/poster/
# session + plenary + panel. Refresh via ListPaperStatuses if the event changes.
PRESENTING_STATUS_IDS = [
  'ca85bc87-bf92-422a-bd42-7995c73c54cb', # Accepted // 15 min oral talk
  'c64409a2-62b7-4ea0-9e6d-f99b73ccdd60', # Accepted // 5 min speed talk
  '559b9f1d-02cb-42fd-8c6e-9aae7496fc09', # Accepted // poster
  '794bf86c-0919-4ea3-aefd-cd62296e17f7', # Accepted // session
  '476f70f0-e17a-4394-bb09-0e1bdaecd6ef', # Plenary
  'f92a7288-9c18-4e72-b764-6ca8bbab3d02'  # Panel
].freeze

def build_request(uri, body)
  req = body ? Net::HTTP::Post.new(uri) : Net::HTTP::Get.new(uri)
  HEADERS.each { |k, v| req[k] = v }
  req.body = JSON.generate(body) if body
  req
end

def api(endpoint, body: nil)
  uri = URI("#{BASE}/#{endpoint}?#{QUERY}")
  Net::HTTP.start(uri.host, uri.port, use_ssl: true) do |http|
    res = http.request(build_request(uri, body))
    raise "#{endpoint} -> HTTP #{res.code}" unless res.code == '200'

    JSON.parse(res.body)
  end
end

def presence(value)
  str = value.to_s.strip
  str.empty? ? nil : str
end

# name -> { organization, position } from the speaker directory
def build_directory(speakers)
  speakers.each_with_object({}) do |s, dir|
    name = "#{s['firstName']} #{s['lastName']}".strip
    next if name.empty?

    dir[name] ||= { 'organization' => presence(s['organization']), 'position' => presence(s['position']) }
  end
end

def parse_session_name(name)
  parts = name.split(' | ').map(&:strip)
  title_match = name.match(/#\d+\s+(.*)/)
  {
    'sessionNumber' => name[/#(\d+)/, 1],
    'slot' => (parts.length >= 3 ? parts[0] : nil),
    'room' => (parts.length >= 3 ? parts[1] : nil),
    'title' => (title_match ? title_match[1].strip : parts.last)
  }
end

def presenters_for(pres)
  authors = pres['presentationAuthors'] || []
  flagged = authors.select { |a| a['isPresentingAuthor'] }
  chosen = flagged.empty? ? authors.first(1) : flagged
  chosen.map { |a| a['name'] }.compact
end

def build_presentation(pres)
  presenters = presenters_for(pres)
  {
    'startTime' => pres['startTime'],
    'title' => pres['title'],
    'type' => pres['type'],
    'presenter' => presenters.first,
    'coPresenters' => presenters.drop(1),
    'authors' => pres['authors'] || [],
    'affiliations' => (pres['affiliations'] || []).map { |a| a['text'] }.compact
  }
end

def build_session(sess, directory) # rubocop:disable Metrics/MethodLength, Metrics/AbcSize
  meta = parse_session_name(sess['name'].to_s)
  presentations = (sess['presentations'] || []).map { |p| build_presentation(p) }
  names = presentations.flat_map { |p| [p['presenter'], *p['coPresenters']] }.compact.uniq
  {
    'id' => sess['id'],
    'sessionNumber' => meta['sessionNumber'],
    'slot' => meta['slot'],
    'room' => meta['room'],
    'location' => sess['location'],
    'title' => meta['title'],
    'date' => sess['date'],
    'startTime' => sess['startTime'],
    'endTime' => sess['endTime'],
    'presenters' => names.map { |n| { 'name' => n, 'organization' => directory.dig(n, 'organization') } },
    'presentations' => presentations
  }
end

agenda = api('GetAgendaData', body: {
               includePresentingAuthors: true,
               includeNonPresentingAuthors: true,
               includeKeywords: true,
               statusIds: PRESENTING_STATUS_IDS
             })
speakers = api('GetSpeakerData')

FileUtils.mkdir_p(CACHE)
File.write(File.join(CACHE, 'agenda_full.json'), JSON.generate(agenda))
File.write(File.join(CACHE, 'speakers.json'), JSON.generate(speakers))

directory = build_directory(speakers)
sessions = agenda.select { |a| a['agendaType'] == 'session' }
                 .map { |sess| build_session(sess, directory) }
unique_presenters = sessions.flat_map { |s| s['presenters'].map { |p| p['name'] } }.uniq

note = 'Programme is subject to change; re-run fetch_programme.rb to refresh. ' \
       'Presenter = flagged presenting author; coPresenters/authors give the full byline.'
out = {
  'meta' => {
    'event' => '16th International Coral Reef Symposium (ICRS 2026)',
    'source' => 'EventsAir GetAgendaData — tenant=innovators projectId=23820057',
    'note' => note,
    'sessionCount' => sessions.length,
    'presentationCount' => sessions.sum { |s| s['presentations'].length },
    'uniquePresenterCount' => unique_presenters.length
  },
  'sessions' => sessions
}

File.write(File.join(DIR, 'presenters.json'), "#{JSON.pretty_generate(out)}\n")
puts format('presenters.json: sessions=%<s>d presentations=%<p>d uniquePresenters=%<u>d',
            s: sessions.length, p: out['meta']['presentationCount'], u: unique_presenters.length)
