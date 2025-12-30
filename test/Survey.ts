import { expect } from "chai";
import { Contract } from "ethers";
import { network } from "hardhat";
import { title } from "process";
import type { SurveyFactory } from "../types/ethers-contracts/SurveyFactory.js";
interface Question {
    question: string;
    options: string[];
}
/* 
it("Survey init", async () => {
    const { ethers } = await network.connect();

    const title = "막무가내 설문조사";
    const description = "중앙화된 설문조사로서, 모든 데이터는 공개되지 않으며 설문조사를 게시한자만 볼 수 있습니다.";
    const questions: Question[] = [
        {
            question: "누가 내 응답을 관리할때 더 솔직할 수 있을까요?",
            options: ["구글폼 운영자", "탈중앙화된 블록체인 (관리주체 없으며 모든 데이터 공개)", "상관없음",],
        }
    ]
    
    const factory = await ethers.deployContract("SurveyFactory", [
        ethers.parseEther("50"),
        ethers.parseEther("0.1"),
    ]);
    const tx = await factory.createSurvey({
        title,
        description,
        targetNumber: 100,
        questions,
    }, {
        value: ethers.parseEther("100"),
    });

    // const surveys = await factory.getSurveys();
    const receipt = await tx.wait();
    let surveyAddress;
    receipt?.logs.forEach((log) => {
        const event = factory.interface.parseLog(log)
        if(event?.name == "SurveyCreated") {
            surveyAddress = event.args[0];
        }
    })


    // await ethers.deployContract("Survey", [title, description, ...])
    const surveyC = await ethers.getContractFactory("Survey");
    const signers = await ethers.getSigners();
    const respondent = signers[0];
    if(surveyAddress) {
        const survey = await surveyC.attach(surveyAddress);
        await survey.connect(respondent);
        console.log(ethers.formatEther(await ethers.provider.getBalance(respondent)));
        const submitTx = await survey.submitAnswer({
            respondent,
            answers: [1],
        });
        await submitTx.wait();
        console.log(ethers.formatEther(await ethers.provider.getBalance(respondent)));
    }

});
*/

// assignment 2
describe("SurveyFactory Contract", () => {

  let factory: SurveyFactory, owner, respondent1, respondent2;
  let ethers: any;

  const surveySchema = {
    title: "1st",
    description: "test",
    targetNumber: 100,
    questions: []
  }

  beforeEach(async () => {
    const hre = await network.connect();
    ethers = hre.ethers;

    [owner, respondent1, respondent2] = await ethers.getSigners(); // signer0 -> owner, signer1 -> respondent1, signer2 -> respondent2


    factory = await ethers.deployContract("SurveyFactory", [    // factory에 SurveyFactory contract deploy

      ethers.parseEther("50"), // min_pool_amount

      ethers.parseEther("0.1"), // min_reward_amount

    ]);

  });


  it("should deploy with correct minimum amounts", async () => {

    // TODO: check min_pool_amount and min_reward_amount
    expect(await factory.min_pool_amount()).to.equal(ethers.parseEther("50"));
    expect(await factory.min_reward_amount()).to.equal(ethers.parseEther("0.1"))
  });


  it("should create a new survey when valid values are provided", async () => {

    // TODO: prepare SurveySchema and call createSurvey with msg.value

    // TODO: check event SurveyCreated emitted

    // TODO: check surveys array length increased

    const tx = await factory.createSurvey(surveySchema, {
        value: ethers.parseEther("100"),
    });

    await expect(tx).to.emit(factory, "SurveyCreated");

    const surveys = await factory.getSurveys();
    expect(surveys.length).to.equal(1);
  });


  it("should revert if pool amount is too small", async () => {

    // TODO: expect revert when msg.value < min_pool_amount

    await expect(
        factory.createSurvey(surveySchema, {
            value: ethers.parseEther("10"),
        })
    ).to.be.revertedWith("Insufficient pool amount");

  });


  it("should revert if reward amount per respondent is too small", async () => {

    // TODO: expect revert when msg.value / targetNumber < min_reward_amount
    await expect(factory.createSurvey({
        ...surveySchema,
        targetNumber: 1000,
    }, {
        value: ethers.parseEther("50"),
    })).to.be.revertedWith("Insufficient reward amount");
  });


  it("should store created surveys and return them from getSurveys", async () => {

    // TODO: create multiple surveys and check getSurveys output
    await factory.createSurvey(surveySchema, {
        value: ethers.parseEther("100"),
    });

    await factory.createSurvey({
        ...surveySchema,
        title: "2nd"
    }, {
      value: ethers.parseEther("120"),  
    });

    const surveys = await factory.getSurveys();
    expect(surveys.length).to.equal(2);
  });

});