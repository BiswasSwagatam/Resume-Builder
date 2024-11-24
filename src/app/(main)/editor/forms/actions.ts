"use server";

import { genAI } from "@/lib/gemini";
import {
  GenerateSummaryInput,
  generateSummarySchema,
  GenerateWorkExperienceInput,
  generateWorkExperienceSchema,
  WorkExperience,
} from "@/lib/validation";

export async function generateSummary(input: GenerateSummaryInput) {
  const { jobTitle, workExperiences, educations, skills } =
    generateSummarySchema.parse(input);

  const systemInstruction = `
    You are a job resume generator AI. Your task is to write a professional introduction summary for a resume given the user's provided data.
    Only return the summary and do not include any other information in the response. Keep it concise and professional.
    `;

  const userMessage = `
    Please generate a professional resume summary from this data:

    Job title: ${jobTitle || "N/A"}

    Work experience:
    ${workExperiences
      ?.map(
        (exp) => `
        Position: ${exp.position || "N/A"} at ${exp.company || "N/A"} from ${exp.startDate || "N/A"} to ${exp.endDate || "Present"}

        Description:
        ${exp.description || "N/A"}
        `,
      )
      .join("\n\n")}

      Education:
    ${educations
      ?.map(
        (edu) => `
        Degree: ${edu.degree || "N/A"} at ${edu.school || "N/A"} from ${edu.startDate || "N/A"} to ${edu.endDate || "N/A"}
        `,
      )
      .join("\n\n")}

      Skills:
      ${skills}
    `;

  //   console.log("systemInstruction", systemInstruction);
  //   console.log("userMessage", userMessage);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemInstruction,
  });

  const prompt = userMessage;
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text;

  if (!text) {
    throw new Error("Could not generate summary");
  }

  //   console.log("Text: ", text());
  return text();
}

export async function generateWorkEXperience(
  input: GenerateWorkExperienceInput,
) {
  const { description } = generateWorkExperienceSchema.parse(input);

  const systemInstruction = `
     You are a job resume generator AI. Your task is to generate a single work experience entry based on the user input.
  Your response must adhere to the following structure. You can omit fields if they can't be infered from the provided data, but don't add any new ones.

  Job title: <job title>
  Company: <company name>
  Start date: <format: YYYY-MM-DD> (only if provided)
  End date: <format: YYYY-MM-DD> (only if provided)
  Description: <an optimized description in bullet format, might be infered from the job title>
    `;

  const userMessage = `
        Please generate a work experience entry based on this description:
        ${description}
    `;

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemInstruction,
  });

  const prompt = userMessage;
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text;

  if (!text) {
    throw new Error("Could not generate summary");
  }

  console.log("Text: ", text());

  return {
    position: text().match(/Job title: (.*)/)?.[1] || "",
    company: text().match(/Company: (.*)/)?.[1] || "",
    description: (text().match(/Description:([\s\S]*)/)?.[1] || "").trim(),
    startDate: text().match(/Start date: (\d{4}-\d{2}-\d{2})/)?.[1],
    endDate: text().match(/End date: (\d{4}-\d{2}-\d{2})/)?.[1],
  } satisfies WorkExperience;
}
