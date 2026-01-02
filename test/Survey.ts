import { expect } from "chai";
import { Contract, keccak256 } from "ethers";
import { network } from "hardhat";
import { title } from "process";
import type { SurveyFactory } from "../types/ethers-contracts/SurveyFactory.js";
interface Question {
    question: string;
    options: string[];
}

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

    const survey = await ethers.deployContract("Survey", [
        title,
        description,
        100,
        questions,
    ], {
        value: ethers.parseEther("100"),
    });

    const slot0 = ethers.toBeHex(0, 32);
    // console.log(slot0);
    const slot0Data = await ethers.provider.getStorage(
      survey.getAddress(), 
      ethers.toBeHex(0, 32),  // 슬롯 넘버를 주어야 함
    ); 

    const slot1Data = await ethers.provider.getStorage(
      survey.getAddress(), 
      ethers.toBeHex(1, 32),  // 슬롯 넘버를 주어야 함
    ); 

    const slot2Data = await ethers.provider.getStorage(
      survey.getAddress(), 
      ethers.toBeHex(2, 32),  // 슬롯 넘버를 주어야 함
    ); 

    const slot3Data = await ethers.provider.getStorage(
      survey.getAddress(), 
      ethers.toBeHex(3, 32),  // 슬롯 넘버를 주어야 함
    ); 

    const slot4Data = await ethers.provider.getStorage(
      survey.getAddress(), 
      ethers.toBeHex(4, 32),  // 슬롯 넘버를 주어야 함
    ); 

    const slot5Data = await ethers.provider.getStorage(
      survey.getAddress(), 
      ethers.toBeHex(5, 32),  // 슬롯 넘버를 주어야 함
    );
    
    const slot6Data = await ethers.provider.getStorage(
      survey.getAddress(), 
      ethers.toBeHex(6, 32),  // 슬롯 넘버를 주어야 함
    );

    const decodeUni = (hex: string) => 
      Buffer.from(hex.slice(2), 'hex').toString('utf-8');

    const nextHash = (hex: string, i: number) =>
      "0x" + (BigInt(hex) + BigInt(i)).toString(16);

    console.log(slot0Data);

    // primitive type
    console.log("--- primitive types ---");
    console.log(slot2Data);
    console.log(slot3Data);

    // long string type
    console.log("\n--- long string types ---");
    console.log(slot1Data); // 0x103 == 259
    // pDesc = hash256(pSlot1), getStorage(pDesc)
    const pDesc = keccak256(ethers.toBeHex(1, 32));
    const desc0 = await ethers.provider.getStorage(await survey.getAddress(), pDesc);
    console.log(desc0); // 이러면 중간에 짤린 메시지가 추가된다. 따라서 pdesc의 다음 주소 '+1' 을 알아야 한다.

    const desc1 = await ethers.provider.getStorage(await survey.getAddress(), nextHash(pDesc, 1));

    const desc2 = await ethers.provider.getStorage(await survey.getAddress(), nextHash(pDesc, 2));

    const desc3 = await ethers.provider.getStorage(await survey.getAddress(), nextHash(pDesc, 3));

    const desc4 = await ethers.provider.getStorage(await survey.getAddress(), nextHash(pDesc, 4));

    const pQuestions = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
    // map
    console.log(slot6Data);
    const addr = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
    const mapKeyAddr = keccak256(
      ethers.toBeHex(addr, 32) + ethers.toBeHex(6, 32).slice(2),
    );
    const map1Value = await ethers.provider.getStorage(
      survey.getAddress(),
      nextHash(pQuestions, 3),
    );
});

// assignment 2
/*
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
*/
