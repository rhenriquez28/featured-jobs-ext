const companies = {
  vercel: {
    careersPage: "https://vercel.com/careers",
    featuredJobs: [
      {
        name: "Business Systems, Analyst",
        link: "https://vercel.com/careers/business-systems-analyst-us-4919040004",
        location: "Remote (United States)",
        salary: {
          min: 100000,
          max: 200000,
        },
      },
      {
        name: "Senior Software Engineer, Platform",
        link: "https://vercel.com/careers/5e8f9f9e-4b9a-4b0a-9e0a-0a9a1a1a1a1a",
        location: "Remote",
        salary: {
          min: 100000,
          max: 200000,
        },
      },
      {
        name: "Senior Software Engineer, Platform",
        link: "https://vercel.com/careers/5e8f9f9e-4b9a-4b0a-9e0a-0a9a1a1a1a1a",
        location: "Remote",
        salary: {
          min: 100000,
          max: 200000,
        },
      },
    ],
  },
};

const companyHandleList = Object.keys(companies);

const globalSelectors = {};
globalSelectors.profileTabSection = `[aria-label="Profile timelines"]`;

const jobSectionSelector = "chrome-featured-jobs-section";
const innerSelectors = {};

async function doWork() {
  const companyHandle = document.location.pathname.replace("/", "");

  const profileTabSection = document.querySelector(
    globalSelectors.profileTabSection
  );

  if (
    !profileTabSection ||
    !companyHandleList.includes(companyHandle) ||
    document.getElementsByClassName(jobSectionSelector).length > 0
  ) {
    return;
  }

  profileTabSection.prepend(createJobsSection(companyHandle));
}

function createJobsSection(handle) {
  const jobsSection = document.createElement("div");
  jobsSection.classList.add(jobSectionSelector);
  jobsSection.innerHTML = `
        <div class="jobs-section__header">
            <h2 class="jobs-section__title">Featured Jobs</h2>
            <a href="${
              companies[handle].careersPage
            }" class="jobs-section__view-all" target="_blank">View All</a>
        </div>
        <div class="jobs-section__body">
            ${createJobsList(handle)}
        </div>
    `;
  return jobsSection;
}

function createJobsList(handle) {
  const jobsList = document.createElement("ul");
  jobsList.classList.add("jobs-list");
  companies[handle].featuredJobs.forEach((job) => {
    jobsList.innerHTML += `

            <li class="jobs-list__item">
                <a href="${job.link}" target="_blank" class="jobs-list__item-link">
                    <div class="jobs-list__item-header">
                        <h3 class="jobs-list__item-title">${job.name}</h3>
                        <span class="jobs-list__item-location">${job.location}</span>
                    </div>
                    <div class="jobs-list__item-footer">
                        <span class="jobs-list__item-salary">${job.salary.min} - ${job.salary.max}</span>
                    </div>
                </a>
            </li>
            `;
  });
  return jobsList.outerHTML;
}

function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

// Function to start MutationObserver
const observe = () => {
  const observer = new MutationObserver((mutationsList) => {
    if (!mutationsList.length) return;

    const runDocumentMutations = throttle(async () => {
      await doWork();
    }, 1000);

    runDocumentMutations();
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
  });
};

observe();
