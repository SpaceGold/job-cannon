import { Configuration, OpenAIApi } from "openai";
import { getWorkPlay } from "./db_queries";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }
  const animal = req.body.animal || "";
  if (animal.trim().length === 0) {
    // az what is this fitler criteria?
    res.status(400).json({
      error: {
        message: "Please enter a valid topic",
      },
    });
    return;
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.01,
      messages: [{ role: "user", content: generatePrompt(animal) }],
    });
    const dbRes = await getWorkPlay(req, res);
    console.log("dbREs ", dbRes);

    res
      .status(200)
      .json({ result: completion.data.choices[0].message.content });
    writeOut(result);
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function generatePrompt(animal) {
  const capitalizedAnimal =
    animal[0].toUpperCase() + animal.slice(1).toLowerCase();
  return `very very briefly describe ${capitalizedAnimal} doing something super silly`;
}
