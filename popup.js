document.getElementById('getProblems').addEventListener('click', async () => {
  const userInput = document.getElementById('userInput').value.toLowerCase();
  try {
      // Call GorQ AI to extract keywords
      const gptResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer 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`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              "messages": [
                  {
                      "role": "user",
                      "content": `Extract keywords for LeetCode problems: ${userInput}`
                  }
              ],
              "model": "mixtral-8x7b-32768"
          })
      });

      const keywordsResponse = await gptResponse.json();
      const keywords = keywordsResponse.choices[0].message.content.toLowerCase().split(',').map(k => k.trim());
      console.log('Extracted keywords:', keywords);

      // Call unofficial LeetCode API
      await searchLeetCodeProblems(userInput, keywords);
  } catch (error) {
      console.error('Error:', error);
      document.getElementById('results').innerText = `Error: ${error.message}\n\nPlease check the console for more details.`;
  }
});

async function searchLeetCodeProblems(userInput, keywords) {
  const apiUrl = `https://alfa-leetcode-api.onrender.com/problems?limit=50`;

  try {
      const leetCodeResponse = await fetch(apiUrl);
      const leetCodeData = await leetCodeResponse.json();

      console.log('LeetCode API response:', JSON.stringify(leetCodeData, null, 2));

      let problems = leetCodeData.problemsetQuestionList || [];

      console.log('Extracted problems:', problems.slice(0, 5)); // Log first 5 problems

      const filteredProblems = problems.filter(problem => {
          const title = problem.title.toLowerCase();
          const tags = problem.topicTags.map(tag => tag.name.toLowerCase());
          return keywords.some(keyword => 
              title.includes(keyword) || tags.includes(keyword)
          ) || userInput.split(' ').some(word => 
              title.includes(word) || tags.includes(word)
          );
      });

      displayProblems(filteredProblems);
  } catch (error) {
      console.error('Error:', error);
      document.getElementById('results').innerText = `Error: ${error.message}\n\nPlease check the console for more details.`;
  }
}

function displayProblems(problems) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  if (problems.length === 0) {
      resultsDiv.innerText = 'No matching problems found.';
      return;
  }

  problems.forEach(problem => {
      const problemElement = document.createElement('div');
      const title = problem.title || 'Untitled Problem';
      const titleSlug = problem.titleSlug || '';
      const difficulty = problem.difficulty || 'Unknown';
      const tags = problem.topicTags.map(tag => tag.name).join(', ');
      const problemUrl = `https://leetcode.com/problems/${titleSlug}`;
      
      problemElement.innerHTML = `
          <h3><a href="${problemUrl}" target="_blank">${title}</a></h3>
          <p>Difficulty: ${difficulty}</p>
          <p>Tags: ${tags}</p>
      `;
      resultsDiv.appendChild(problemElement);
  });
}