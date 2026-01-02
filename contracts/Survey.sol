// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

struct Question {
  string question;
  string[] options;
}

struct Answer {
  address respondent;
  uint8[] answers;
}

// 기본적으로 state들은 slot에 차곡차곡 저장이 되는데 primitive 타입의 경우 슬롯에 그 값이 저장되고, 참조타입의 경우 32byte 보다 커지기 때문에 다른 방식으로 저장된다.
contract Survey {
  string public title; // 길이가 길 경우 참조 타입이지만 짧을 경우에는 primitive 타입처럼 동작함.
  string public description;
  uint256 public targetNumber;
  uint256 public rewardAmount;
  Question[] public questions;
  Answer[] answers;
  mapping(address => uint) test1Map;
  mapping(address => uint) test2Map;

  constructor(
    string memory _title,
    string memory _description,
    uint256 _targetNumber,
    Question[] memory _questions
  ) payable {
    title = _title;
    description = _description;
    targetNumber = _targetNumber;
    rewardAmount = msg.value / _targetNumber;
    test1Map[0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199] = 1000;
    for (uint i = 0; i < _questions.length; i++) {
      /*    questions.push(
                Question({
                    question:_questions[i].question,
                    options:_questions[i].options
                })
            );
        */
      Question storage q = questions.push /*Question({})*/();
      q.question = _questions[i].question;
      q.options = _questions[i].options;
    }
  }

  function submitAnswer(Answer calldata _answer) external {
    // length validation
    require(
      _answer.answers.length == questions.length,
      "Mismatched answers length"
    );
    require(answers.length < targetNumber, "This survey has been ended");

    answers.push(
      Answer({respondent: _answer.respondent, answers: _answer.answers})
    );
    payable(msg.sender).transfer(rewardAmount);
  }

  function getAnswers() external view returns (Answer[] memory) {
    return answers;
  }

  function getQuestions() external view returns (Question[] memory) {
    return questions;
  }
}
