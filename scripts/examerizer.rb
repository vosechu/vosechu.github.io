# ruby exams/2.rb > exams/2.md

module Examerizer
  PRINT_VERSION = ENV['PRINT_VERSION'] || false
  TEACHER_VERSION = ENV['TEACHER_VERSION'] || false
  @@question_number = 1 # Initial question number and counter

  class Exam
    TIME_TO_ANSWER = {
      questions: 1,
      short_answers: 4,
      project_answers: 3
    }

    attr_reader :title
    attr_accessor :sections

    def initialize(title, seed)
      @title = title
      @sections = []

      # Ensure that between runs the exam orders don't change. Increment the seed to change the order of the exam
      srand(seed)
    end

    def to_s
      msg = ""

      unless PRINT_VERSION
        msg += "---
  layout: page
  title: #{@title}
  ---\n\n"
      end

      msg += @sections.map(&:to_s).join("\n")

      if TEACHER_VERSION
        msg += "\n\nQuestions: #{questions.count} Est: #{estimate(:questions)} hours @ #{TIME_TO_ANSWER[:questions]} min / answer"
        msg += "\n\nShort Answers: #{short_answers.count} Est: #{estimate(:short_answers)} hours @ #{TIME_TO_ANSWER[:short_answers]} min / answer"
        msg += "\n\nProject Answers: #{project_answers.count} Est: #{estimate(:project_answers)} hours @ #{TIME_TO_ANSWER[:project_answers]} min / answer"
        msg += "\n\nTotal Estimate: #{sprintf("%.2f", total_estimate)} hours"
      end

      return msg
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
      msg = "## #{@title}\n"
      unless @questions.empty?
        msg += "### Multiple-choice Answer\n\n"
        @questions.shuffle.each do |question|
          msg += "#{@@question_number}#{"\\" unless PRINT_VERSION}. #{question.to_s}\n"
          msg += "***\n\n"
          @@question_number += 1
        end
      end
      unless @short_answers.empty?
        msg += "### Short Answer\n\n"
        @short_answers.shuffle.each do |question|
          msg += "#{@@question_number}#{"\\" unless PRINT_VERSION}. #{question.to_s}\n"
          msg += "***\n\n"
          @@question_number += 1
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
          msg += "#{"=> " if TEACHER_VERSION}* #{choice}#{answer}\n"
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
        if PRINT_VERSION
          if r == index
            msg += "#{"=> " if TEACHER_VERSION}* #{choice}\n#{answer.split("\n").join("\n")}\n"
          else
            msg += "* #{choice}\n#{alt_answers.pop.split("\n").join("\n")}\n"
          end
        else
          if r == index
            msg += "#{"=> " if TEACHER_VERSION}* #{choice}\n{% highlight #{@style} %}\n#{answer.split("\n").join("\n")}\n{% endhighlight %}\n"
          else
            msg += "* #{choice}\n{% highlight #{@style} %}\n#{alt_answers.pop.split("\n").join("\n")}\n{% endhighlight %}\n"
          end
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
      if PRINT_VERSION
        msg += "A: \n\n\n\n\n\n"
      else
        msg += "A: \n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n"
      end

      return msg
    end
  end

  class LongAnswer < ShortAnswer
    def to_s
      msg = "Q: #{@question}\n\n"
      if PRINT_VERSION
        msg += "A: \n\n\n\n\n\n\n\n\n\n\n"
      else
        msg += "A: \n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n"
      end

      return msg
    end
  end

  class ProjectAnswer < ShortAnswer
    def to_s
      @question
    end
  end
end