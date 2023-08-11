# Featured Jobs For X (Formerly Twitter)

An extension inspired by [this Primagen tweet](https://twitter.com/ThePrimeagen/status/1689012378061639680) so that companies can show some of their jobs on their X profile. I thought Primagen showed a mockup, so I decided to do this extension, and realized later that is actually a feature [X is starting to roll out for verified companies](https://techcrunch.com/2023/07/20/twitter-prepping-job-listings-feature-verified-organizations/) and it's not available for everybody yet. Oh well, at least it was fun! :)

![785a0993-1587-47b3-b6d2-8003dca863e3](https://github.com/rhenriquez28/featured-jobs-ext/assets/22778956/716e36d1-72c0-48f8-895a-36bf89b27211)


If you're a company and want to add jobs to your profile, just add a PR modifying `companies.json` with the following structure and I'll accept it:

```json
{
  "<yourCompanyHandle>": {
    "careersPage": "https://vercel.com/careers",
    "featuredJobs": [
      {
        "name": "Business Systems, Analyst",
        "link": "https://vercel.com/careers/business-systems-analyst-us-4919040004",
        "location": "Remote (United States)",
        "salary": { "min": 100000, "max": 200000, "currency": "USD" }
      }
      // add as many as you like
    ]
  }
}
```

# HOW TO INSTALL MANUALLY

1. Download latest .zip from [releases](https://github.com/rhenriquez28/featured-jobs-ext/releases)
2. Unzip the file
3. Go to `chrome://extensions/` in your browser
4. Enable developer mode
5. Click "Load unpacked"
6. Select the folder you unzipped
7. I copied this instructions [from Theo](https://github.com/t3dotgg/paycheck-extension) so I hope they're good enough
