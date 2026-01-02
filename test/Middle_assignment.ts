import { expect } from "chai";
import { trace } from "console";
import { sign } from "crypto";
import { network } from "hardhat";

interface Question {
    question: string;
    options: string[];
}

describe("Survey init", () => {

  const title = "막무가내 설문조사라면";

  const description =

    "중앙화된 설문조사로서, 모든 데이터는 공개되지 않으며 설문조사를 게시한자만 볼 수 있습니다.";

  const questions: Question[] = [

    {

      question: "누가 내 응답을 관리할때 더 솔직할 수 있을까요?",

      options: [

        "구글폼 운영자",

        "탈중앙화된 블록체인 (관리주체 없으며 모든 데이터 공개)",

        "상관없음",

      ],

    },

  ];

  const targetNumber = 2;
  const poolAmount = BigInt(10 ** 18);

  const getSurveyContractAndEthers = async (survey: {

    title: string;

    description: string;

    targetNumber: number;

    questions: Question[];

  }) => {

    const { ethers } = await network.connect();

    const cSurvey = await ethers.deployContract("Survey", [

      survey.title,

      survey.description,

      survey.targetNumber,

      survey.questions,

    ], {
        value: poolAmount,
    });

    return { ethers, cSurvey };

  };


  describe("Deployment", () => {

    it("should store survey info correctly", async () => {

      const { cSurvey } = await getSurveyContractAndEthers({
        title,
        description,
        targetNumber,
        questions,
      });

      expect(await cSurvey.title()).to.equal(title);
      expect(await cSurvey.description()).to.equal(description);
      expect(await cSurvey.targetNumber()).to.equal(targetNumber);

    });

    it("should calculate rewardAmount correctly", async () => {

      const { cSurvey } = await getSurveyContractAndEthers({
        title,
        description,
        targetNumber,
        questions,
      });

      const reward = await cSurvey.rewardAmount();
      expect(reward).to.equal(poolAmount / BigInt(targetNumber));

    });

  });


  describe("Questions and Answers", () => {

    it("should return questions correctly", async () => {

      const { cSurvey } = await getSurveyContractAndEthers({
        title,
        description,
        targetNumber,
        questions,
      });

      const storedQuestions = await cSurvey.getQuestions();
      expect(storedQuestions.length).to.equal(1);
      expect(storedQuestions[0].question).to.equal(questions[0].question);
      expect(storedQuestions[0].options.length).to.equal(
        questions[0].options.length
      );

    });

    it("should allow valid answer submission", async () => {

      const { ethers, cSurvey } = await getSurveyContractAndEthers({
        title,
        description,
        targetNumber,
        questions,
      });

      const [signers] = await ethers.getSigners();

      await cSurvey.connect(signers).submitAnswer({
        respondent: signers.address,
        answers: [1],
      });

      const answers = await cSurvey.getAnswers();
      expect(answers.length).to.equal(1);
      expect(answers[0].respondent).to.equal(signers.address);

    });

    it("should revert if answer length mismatch", async () => {

      const { ethers, cSurvey } = await getSurveyContractAndEthers({
        title,
        description,
        targetNumber,
        questions,
      });

      const [signers] = await ethers.getSigners();

      await expect(
        cSurvey.connect(signers).submitAnswer({
            respondent: signers.address,
            answers: [],
        })
      ).to.be.revertedWith("Mismatched answers length");

    });

    it("should revert if target reached", async () => {

      const { ethers, cSurvey } = await getSurveyContractAndEthers({
        title,
        description,
        targetNumber: 1,
        questions,
      });

      const [signer0, signer1] = await ethers.getSigners();

      await cSurvey.connect(signer0).submitAnswer({
        respondent: signer0.address,
        answers: [0],
      });

      await expect(
        cSurvey.connect(signer1).submitAnswer({
            respondent: signer1.address,
            answers: [1],
        })
      ).to.be.revertedWith("This survey has been ended")

    });

  });


  describe("Rewards", () => {

    it("should pay correct reward to respondent", async () => {

      const { ethers, cSurvey } = await getSurveyContractAndEthers({
        title,
        description,
        targetNumber,
        questions,
      });

      const [signers] = await ethers.getSigners();
      const reward = await cSurvey.rewardAmount();

      const before = await ethers.provider.getBalance(signers.address);

      const tx = await cSurvey.connect(signers).submitAnswer({
        respondent: signers.address,
        answers: [2],
      });
      await tx.wait();

      const after = await ethers.provider.getBalance(signers.address);
      expect(after).to.be.greaterThan(before);
    });

  });

});