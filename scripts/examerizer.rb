# ruby exams/2.rb > exams/2.md

$question_number = 1

class Exam
  TIME_TO_ANSWER = {
    questions: 2,
    short_answers: 7,
    project_answers: 5
  }

  attr_reader :title
  attr_accessor :sections

  def initialize(title)
    @title = title
    @sections = []
  end

  def to_s
    msg = "---
layout: page
title: #{@title}
---\n\n"
    msg += @sections.map(&:to_s).join("\n")

    msg += "\n\nQuestions: #{questions.count} Est: #{estimate(:questions)} hours @ #{TIME_TO_ANSWER[:questions]} min / answer"
    msg += "\n\nShort Answers: #{short_answers.count} Est: #{estimate(:short_answers)} hours @ #{TIME_TO_ANSWER[:short_answers]} min / answer"
    msg += "\n\nProject Answers: #{project_answers.count} Est: #{estimate(:project_answers)} hours @ #{TIME_TO_ANSWER[:project_answers]} min / answer"
    msg += "\n\nTotal Estimate: #{sprintf("%.2f", total_estimate)} hours"
  end

  def questions
    self.sections.reduce([]) {|sum, s| sum += s.questions }
  end

  def short_answers
    self.sections.reduce([]) {|sum, s| sum += s.short_answers }
  end

  def project_answers
    self.sections.reduce([]) {|sum, s| sum += s.project_answers }
  end

  def total_estimate
    total = 0
    TIME_TO_ANSWER.each do |key, value|
      total += self.send(key).count * value
    end
    return (total / 60.0 * 100).round * 0.01
  end

  def estimate(section)
    sprintf("%.2f", self.send(section).count * TIME_TO_ANSWER[section] / 60.0)
  end
end

class Section
  attr_reader :title
  attr_accessor :questions, :short_answers, :project_answers

  def initialize(title)
    @title = title
    @questions = []
    @short_answers = []
    @project_answers = []
  end

  def to_s
    unless @questions.empty?
      msg = "## #{@title}\n"
      msg += "### Multiple-choice Answer\n\n"
      @questions.shuffle.each do |question|
        msg += "#{$question_number}\\. #{question.to_s}\n"
        msg += "***\n\n"
        $question_number += 1
      end
    end
    unless @short_answers.empty?
      msg += "### Short Answer\n\n"
      @short_answers.shuffle.each do |question|
        msg += "#{$question_number}\\. #{question.to_s}\n"
        msg += "***\n\n"
        $question_number += 1
      end
    end
    unless @project_answers.empty?
      msg += "### Project Answers\n\n"
      msg += "Demonstrate the following steps by creating a repo and committing your work:\n\n"
      @project_answers.each_with_index do |question, index|
        msg += "#{index+1}. #{question.to_s}\n"
      end
      msg += "\nUsername:\n\nRepo name:\n\n"
      msg += "***\n\n"
    end
    return msg
  end
end

class Question
  attr_reader :question
  attr_accessor :answer, :alt_answers

  def initialize(question, answer, alt_answers=[])
    @question = question
    @answer = answer
    @alt_answers = alt_answers
  end

  def to_s
    msg = "Q: #{@question}\n\n"
    choices = ["A: ", "B: ", "C: ", "D: "]
    r = Random.rand(0..3)
    choices.each_with_index do |choice, index|
      if r == index
        msg += "* #{choice}#{answer}\n"
      else
        msg += "* #{choice}#{alt_answers.pop}\n"
      end
    end
    return msg
  end
end

class CodeQuestion < Question
  def initialize(question, answer, alt_answers, style = "ruby")
    @style = style
    super(question, answer, alt_answers)
  end

  def to_s
    msg = "Q: #{@question}\n\n"
    choices = ["A: ", "B: ", "C: ", "D: "]
    r = Random.rand(0..3)
    choices.each_with_index do |choice, index|
      if r == index
        msg += "* #{choice}\n{% highlight #{@style} %}\n#{answer.split("\n").join("\n")}\n{% endhighlight %}\n"
      else
        msg += "* #{choice}\n{% highlight #{@style} %}\n#{alt_answers.pop.split("\n").join("\n")}\n{% endhighlight %}\n"
      end
    end
    return msg
  end
end

class ShortAnswer
  attr_reader :question

  def initialize(question)
    @question = question
  end

  def to_s
    msg = "Q: #{@question}\n\n"
    msg += "A: \n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n"

    return msg
  end
end

class LongAnswer < ShortAnswer
  def to_s
    msg = "Q: #{@question}\n\n"
    msg += "A: \n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n"

    return msg
  end
end

class ProjectAnswer < ShortAnswer
  def to_s
    @question
  end
end
