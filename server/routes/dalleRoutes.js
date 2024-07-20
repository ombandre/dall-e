import express from 'express';
import * as dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

const router = express.Router();

// Initialize OpenAI with API key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.route('/').get((req, res) => {
  res.json({ message: 'Hello from DALL-E!' });
});

router.route('/').post(async (req, res) => {
  try {
    const { prompt } = req.body;

    // Check if the prompt is provided
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Generate image using OpenAI API
    const aiResponse = await openai.images.generate({
      prompt,
      n: 1, // Number of images to generate
      size: '1024x1024', // Image size
    });

    // Extract base64 image from response
    const image = aiResponse.data[0].b64_json;

    // Send image data as JSON response
    res.json({ photo: image });
  } catch (error) {
    console.error('Error generating image:', error);

    // Handle billing-related errors
    if (error.code === 'billing_hard_limit_reached') {
      return res.status(402).json({ error: 'Billing hard limit has been reached. Please check your billing account or contact support.' });
    }

    // Handle other types of errors
    const errorMessage = error.response?.data?.error?.message || 'Something went wrong';
    res.status(error.response?.status || 500).json({ error: errorMessage });
  }
});

export default router;
