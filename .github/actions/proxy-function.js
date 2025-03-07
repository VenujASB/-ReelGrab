const axios = require('axios');
const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    // Get the request payload from the workflow dispatch
    const payloadString = process.env.REQUEST_PAYLOAD;
    const payload = JSON.parse(payloadString || '{}');
    
    console.log('Received request payload:', payload);
    
    // Make the request to the target API
    const response = await axios.post('https://bff.listnr.tech/backend/user/getInfoYT', {
      url: payload.url,
      platform: 'instagram',
      type: 'video'
    });
    
    console.log('API response:', response.data);
    
    // Create or update a file in the repository with the response
    // This is where you'd store the result for the frontend to access
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
    const { owner, repo } = github.context.repo;
    
    // Generate a unique ID for this request
    const requestId = payload.requestId || Date.now().toString();
    
    // Store the result in the repository
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: `results/${requestId}.json`,
      message: `Store API result for request ${requestId}`,
      content: Buffer.from(JSON.stringify(response.data)).toString('base64'),
      committer: {
        name: 'GitHub Actions',
        email: 'actions@github.com'
      }
    });
    
    console.log(`Result stored at results/${requestId}.json`);
    
  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
    console.error(error);
  }
}

run();
