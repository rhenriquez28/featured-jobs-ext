const globalSelectors = {};
globalSelectors.profileTabSection = `[aria-label="Profile timelines"]`;

const jobSectionSelector = "chrome-featured-jobs-section";

function removeSpecialCharacters(s) {
  // This regex matches any character that isn't a letter, number, or _ and replaces it with an empty string
  return s.replace(/[^a-zA-Z0-9_]/g, "");
}

async function doWork() {
  const companyHandle = removeSpecialCharacters(
    document.location.pathname.replace("/", "")
  );

  const profileTabSection = document.querySelector(
    globalSelectors.profileTabSection
  );

  const companies = await getCompanies().catch((err) => {
    console.error(err);
  });

  const companyHandleList = Object.keys(companies);

  if (
    !profileTabSection ||
    !companyHandleList.includes(companyHandle) ||
    document.getElementsByClassName(jobSectionSelector).length > 0
  ) {
    return;
  }

  profileTabSection.prepend(createJobsSection(companies, companyHandle));
}

async function getCompanies() {
  const cachedCompaniesKey = "ext-companies";
  const cachedCompanies = localStorage.getItem(cachedCompaniesKey);

  if (cachedCompanies) {
    return JSON.parse(cachedCompanies);
  }

  const companies = await fetchCompanies();
  localStorage.setItem("companies", JSON.stringify(companies));
  const oneDayInMs = 86400000;
  setTimeout(() => {
    localStorage.removeItem(cachedCompaniesKey);
  }, oneDayInMs);
  return companies;
}

async function fetchCompanies() {
  const response = await fetch(
    "https://raw.githubusercontent.com/rhenriquez28/featured-jobs-ext/main/companies.json"
  );
  const data = await response.json();
  return data;
}

function createJobsSection(companies, handle) {
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
            ${createJobsList(companies, handle)}
        </div>
    `;
  return jobsSection;
}

function createJobsList(companies, handle) {
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
