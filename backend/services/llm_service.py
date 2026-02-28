"""LLM service with mock and real implementations."""

import asyncio
import random
from abc import ABC, abstractmethod


ENGLISH_COACH_PROMPT = """You are a friendly and patient AI English speaking coach.
Your role is to:
1. Have natural conversations with the learner in English
2. Gently correct grammar and vocabulary mistakes using recast (repeat their idea with correct form)
3. Encourage the learner and celebrate small improvements
4. Adjust your language complexity to match the learner's level
5. Ask follow-up questions to keep the conversation flowing
6. Keep responses concise (2-3 sentences) to maintain conversational rhythm

Do NOT:
- Use overly complex vocabulary unnecessarily
- Give long grammar lectures
- Be condescending
- Switch to any language other than English unless the learner is completely stuck
"""


class BaseLLMService(ABC):
    @abstractmethod
    async def chat(self, messages: list[dict], system_prompt: str = "") -> str:
        ...


class MockLLMService(BaseLLMService):
    MOCK_RESPONSES = [
        "That's a great start! I noticed you're getting more comfortable with your sentences. Can you tell me more about what you did last weekend?",
        "Good effort! Just a small note - we'd say 'I have been living here for three years' rather than 'I live here three years.' It's a subtle difference. What do you like most about where you live?",
        "Excellent! Your vocabulary is expanding nicely. Let's try something a bit more challenging - how would you describe your ideal vacation?",
        "I understand what you mean perfectly. In more natural English, we'd phrase it as 'I'm looking forward to the weekend.' What plans do you have?",
        "Nice work! Your fluency is really improving. Let's move on to a slightly more challenging topic. What are your thoughts on learning English through movies?",
        "That's an interesting point! I like how you expressed that idea. Could you also tell me about a time when you faced a challenge and how you overcame it?",
        "Well said! You're making great progress. Let me ask you this - if you could travel anywhere in the world, where would you go and why?",
        "Good job with the past tense there! One small thing - we say 'I went to the store' not 'I go to the store' when talking about yesterday. Where do you usually like to shop?",
    ]

    async def chat(self, messages: list[dict], system_prompt: str = "") -> str:
        await asyncio.sleep(random.uniform(0.3, 0.8))
        idx = len(messages) % len(self.MOCK_RESPONSES)
        return self.MOCK_RESPONSES[idx]


class RealLLMService(BaseLLMService):
    """OpenRouter / SiliconFlow via OpenAI-compatible SDK. Wire up when ready."""

    def __init__(self, api_key: str, base_url: str, model: str):
        self.api_key = api_key
        self.base_url = base_url
        self.model = model

    async def chat(self, messages: list[dict], system_prompt: str = "") -> str:
        # TODO: Implement with openai SDK
        # from openai import AsyncOpenAI
        # client = AsyncOpenAI(api_key=self.api_key, base_url=self.base_url)
        # full_messages = []
        # if system_prompt:
        #     full_messages.append({"role": "system", "content": system_prompt})
        # full_messages.extend(messages)
        # response = await client.chat.completions.create(
        #     model=self.model, messages=full_messages
        # )
        # return response.choices[0].message.content
        raise NotImplementedError("Real LLM service not yet configured")
