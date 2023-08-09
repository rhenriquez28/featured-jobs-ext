const globalSelectors = {};
globalSelectors.profileTabSection = `[aria-label="Profile timelines"]`;

const jobSectionId = "featured-jobs-ext-section";

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

  const companyHandleSet = new Set(Object.keys(companies));

  if (
    !profileTabSection ||
    !companyHandleSet.has(companyHandle) ||
    document.getElementById(jobSectionId)
  ) {
    return;
  }

  const profileParent = profileTabSection.parentElement;
  profileParent.insertBefore(
    createJobsSection(companies, companyHandle),
    profileTabSection
  );
}

async function getCompanies() {
  const response = await fetch(
    "https://raw.githubusercontent.com/rhenriquez28/featured-jobs-ext/main/companies.json"
  );
  const data = await response.json();
  return data;
}

const theme = {
  light: {
    title: "rgba(15,20,25,1.00)",
    link: "rgb(29, 155, 240)",
    tile: "rgb(255, 255, 255)",
    border: "2px solid rgb(239, 243, 244)",
  },

  dark: {
    title: "rgba(15,20,25,1.00)",
    link: "rgb(29, 155, 240)",
    tile: "rgb(255, 255, 255)",
    border: "2px solid rgb(239, 243, 244)",
  },
};

function createJobsSection(companies, handle) {
  const jobsSection = document.createElement("div");
  jobsSection.id = jobSectionId;
  jobsSection.style =
    'padding-left: 16px; padding-right: 16px; font-family: "TwitterChirp",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  jobsSection.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="color: ${
              theme.light.title
            }; font-weight: 800;">We're Hiring!</div>
            <a onMouseOver="this.style.textDecoration = 'underline'"
            onMouseOut="this.style.textDecoration = 'none'"
            href="${
              companies[handle].careersPage
            }" target="_blank" style="color:${
    theme.light.link
  };">View all jobs</a>
        </div>
        ${createJobsList(companies, handle)}
    `;
  return jobsSection;
}

function createJobsList(companies, handle) {
  const jobsList = document.createElement("div");
  const numberFormatter = Intl.NumberFormat("en", { notation: "compact" });
  jobsList.style =
    "display: flex; overflow-y: visible; overflow-x: scroll; width: 100%; gap: 12px;";
  companies[handle].featuredJobs.forEach((job) => {
    jobsList.innerHTML += `
            <div style="padding: 12px 20px; background: ${
              theme.light.tile
            }; border-radius: 14px; min-width: fit-content; border: ${
      theme.light.border
    }">
                <a href="${
                  job.link
                }" target="_blank" style="text-decoration: none;">
                    <div style="font-size: 18px; color: ${
                      theme.light.title
                    }; margin-bottom: 8px; font-weight: 800;">
                        ${job.name}
                    </div>
                    <div style="margin-bottom: 8px;">
                      <span>${job.location}</span>
                    </div>
                    <div>
                        <span>${numberFormatter.format(
                          job.salary.min
                        )} - ${numberFormatter.format(job.salary.max)}</span>
                    </div>
                </a>
            </div>
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
