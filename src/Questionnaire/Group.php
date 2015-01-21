<?php
namespace Ubersite\Questionnaire;

class Group
{
  public $groupID;
  public $title;
  public $questions = [];
  public $collapsible = false;
  public $comments = true;
  
  public function __construct($details, $questions)
  {
    $this->groupID = $details->GroupID;
    $this->title = $details->Title;
    foreach ($details->Questions as $questionID) {
      if (isset($questions[$questionID])) {
        $this->questions[] = $questions[$questionID];
      } else {
        throw new \Exception("Couldn't find question with ID $questionID");
      }
    }
    if (isset($details->Collapsible)) {
      $this->collapsible = $details->Collapsible;
    }
    if (isset($details->Comments)) {
      $this->comments = $details->Comments;
    }
  }
  
  public function renderHTML()
  {
    $out = "";
    $extraClass = $this->collapsible ? "optquest" : "";
    $out .= "<fieldset class='question-group $extraClass'>";
    if ($this->collapsible) {
      $out .= "<legend>{$this->title} <span class='help'>click to view questions</span></legend>";
      $out .= "<div class='hide-container'>";
    } else {
      $out .= "<legend>{$this->title}</legend>";
    }

    /** @var Question $question */
    foreach ($this->questions as $key => $question) {
      $out .= $question->renderHTML(($key+1).". ");
    }

    if ($this->comments) {
      $out .= "<label for='question-{$this->groupID}-comments' class='spacing'>Any other comments?</label>";
      $out .= "<textarea rows=3 name='{$this->groupID}-comments' id='question-{$this->groupID}-comments'></textarea>";
    }
    if ($this->collapsible) {
      $out .= "</div>";
    }
    $out .= "</fieldset>";
    return $out;
  }

  // TODO: not a huge fan of this special case
  private function createCommentsQuestion()
  {
    $details = new \stdClass();
    $details->QuestionID = $this->groupID . "-comments";
    $details->Question = "Any other comments?";
    $details->AnswerType = "Textarea";
    return new Question($details);
  }

  public function renderFeedback($allResponses, $users)
  {
    $output = "<fieldset class='question-group feedback'>";
    $output .= "<legend>{$this->title}</legend>";

    $dropdowns = 0;
    $acceptedTypes = ["1-5", "Length", "Dropdown"];
    $responders = [];
    foreach ($this->questions as $question) {
      if (in_array($question->answerType, $acceptedTypes)) {
        $dropdowns++;

        if (!isset($allResponses[$question->questionID])) {
          continue;
        }
        foreach ($allResponses[$question->questionID] as $response) {
          $responders[$response['Username']] = $users[$response['Username']]->Name;
        }
      } else {
        break;
      }
    }

    asort($responders);

    if ($dropdowns && $responders) {
      $output .= "<table>\n";
      $output .= "<tr>\n";
      $output .= "  <th>Person</th>\n";
      for ($i = 0; $i < $dropdowns; $i++) {
        $output .= "  <th style='width: 100px;'>{$this->questions[$i]->questionShort}</th>\n";
      }
      $output .= "</tr>\n";
      foreach ($responders as $username => $person) {
        $output .= "<tr>\n";
        $output .= "  <td>$person</td>";
        for ($i = 0; $i < $dropdowns; $i++) {
          /** @var Question $question */
          $question = $this->questions[$i];

          if (isset($allResponses[$question->questionID][$username])) {
            $response = $allResponses[$question->questionID][$username]['Answer'];
            $bgColour = $question->getColour($response);
            $response = $question->getAnswerString($response);
            $output .= "  <td style='background-color: $bgColour;'>$response</td>\n";
          } else {
            $output .= "  <td style='background-color: ".Question::DEFAULT_COLOUR.";'>--</td>";
          }
        }
        $output .= "</tr>\n";
      }
      $output .= "</table>\n";
    }

    if ($this->comments) {
      $this->questions[] = $this->createCommentsQuestion();
    }

    foreach ($this->questions as $key => $question) {
      if ($key < $dropdowns) {
        continue;
      }
      $output .= $question->renderFeedback($allResponses, $users);
    }
    $output .= "</fieldset>";
    return $output;
  }
}
