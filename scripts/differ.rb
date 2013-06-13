# Connect to gist and enumerate all forks/urls
# Download each forked copy
# Diff against the answer version (argv?)
# Output the MC score, and a highlighted version of the short answers

gist_url = "https://gist.github.com/vosechu/7c7b1c52477a8993aa19/forks"
exam_dir = "/Users/vosechu/Dropbox/Programming\ work/Outside\ Code/vosechu/vosechu.github.com/exams/session2"
answers_dir = "#{exam_dir}/week1-answers"
answers_file = "#{answers_dir}/week1-answers.txt"

require "nokogiri"
require "open-uri"

answers = File.read(answers_file)

# Download the list of students and their exams
doc = Nokogiri::HTML(open(gist_url))

doc.css('.forkers .actions a').each do |link|
  # Download the exam answer page to find the raw url
  fork_url = "https://gist.github.com" + link.attr('href')
  fork = Nokogiri::HTML(open(fork_url))
  handle = fork_url.split('/')[3]

  # Build the raw url
  raw_fork_url = fork.css('.button-group .raw-url').first.attr('href')
  exam = open("https://gist.github.com" + raw_fork_url)

  # Write the user's answers to the filesystem for posterity
  File.write("#{answers_dir}/#{handle}-answers.txt", exam.read)

  # Diff the answers against the official answers
  File.write("#{answers_dir}/#{handle}-diff.txt", `diff -u '#{answers_dir}/#{handle}-answers.txt' '#{answers_file}'`)
end