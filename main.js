chrome.runtime.onMessage.addListener((message) => {
  if (message === "urlChanged") {
    doWork();
  }
});

const selectors = {
  profileTabSection: `[aria-label="Profile timelines"]`,
  jobSectionId: "featured-jobs-ext-section",
};

async function doWork() {
  const companyHandle = removeSpecialCharacters(
    document.location.pathname.replace("/", "")
  );
  const profileTabSection = document.querySelector(selectors.profileTabSection);
  const companies = await getCompanies().catch((err) => {
    console.error(err);
  });
  const companyHandleSet = new Set(Object.keys(companies));

  if (
    !profileTabSection ||
    !companyHandleSet.has(companyHandle) ||
    document.getElementById(selectors.jobSectionId)
  ) {
    return;
  }

  const userThemeColor = document.body.style.backgroundColor;
  const currentTheme = getCurrentTheme(userThemeColor);

  const profileParent = profileTabSection.parentElement;
  profileParent.insertBefore(
    createJobsSection(companies, companyHandle, currentTheme),
    profileTabSection
  );
}

async function getCompanies() {
  const cachedCompaniesKey = "featured-jobs-ext-companies";
  const cachedCompanies = localStorage.getItem(cachedCompaniesKey);
  if (cachedCompanies) {
    return JSON.parse(cachedCompanies);
  }

  const companies = await fetchCompanies();
  localStorage.setItem(cachedCompaniesKey, JSON.stringify(companies));
  const oneHourInMs = 3600000;
  setTimeout(() => {
    localStorage.removeItem(cachedCompaniesKey);
  }, oneHourInMs);
  return companies;
}

async function fetchCompanies() {
  const response = await fetch(
    "https://raw.githubusercontent.com/rhenriquez28/featured-jobs-ext/main/companies.json"
  );
  const data = await response.json();
  return data;
}

function createJobsSection(companies, handle, currentTheme) {
  const jobsSection = document.createElement("div");
  jobsSection.id = selectors.jobSectionId;
  jobsSection.style =
    'padding-left: 16px; padding-right: 16px; font-family: "TwitterChirp",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  jobsSection.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="color: ${
              currentTheme.title
            }; font-weight: 800;">We're Hiring!</div>
            <a href="${companies[handle].careersPage}" target="_blank" 
            style="color:${currentTheme.link}; text-decoration: none">
            View all jobs
            </a>
        </div>
        ${createJobsList(companies, handle, currentTheme)}
    `;
  return jobsSection;
}

function createJobsList(companies, handle, currentTheme) {
  const jobsList = document.createElement("div");
  jobsList.style =
    "display: flex; overflow-y: visible; overflow-x: scroll; width: 100%; gap: 12px;";
  const ellipsisStyle =
    "text-overflow: ellipsis; white-space: nowrap; overflow: hidden;";
  companies[handle].featuredJobs.forEach((job) => {
    const numberFormatter = new Intl.NumberFormat("en", {
      style: "currency",
      notation: "compact",
      currency: job.salary.currency,
    });

    jobsList.innerHTML += `
            <div style="padding: 12px 20px; background: ${
              currentTheme.tile
            }; border-radius: 14px; min-width: fit-content; border: ${
      currentTheme.border
    }">
                <a href="${
                  job.link
                }" target="_blank" style="text-decoration: none;">
                    <div style="color: ${
                      currentTheme.title
                    }; margin-bottom: 8px; font-weight: 800; ${ellipsisStyle}
                    max-width: 280px;">
                        ${job.name}
                    </div>
                    <div style="font-size: 0.9em; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; color: ${
                      currentTheme.subtitle
                    };">
                      ${locationSvg}
                      <span style="${ellipsisStyle} max-width: 80%;">
                      ${job.location}
                      </span>
                    </div>
                    <div style="font-size: 0.9em; display: flex; align-items: center; gap: 8px; color: ${
                      currentTheme.subtitle
                    };">
                    ${moneySvg}
                    <span>${numberFormatter
                      .formatRange(job.salary.min, job.salary.max)
                      .replace("–", " – ")}</span>
                    </div>
                </a>
            </div>
            `;
  });
  return jobsList.outerHTML;
}

function getCurrentTheme(userThemeColor) {
  const themeKeys = Object.keys(themes);
  let currentThemeKey;
  for (const key of themeKeys) {
    if (themeMap[key].includes(userThemeColor)) {
      currentThemeKey = key;
      break;
    }
  }
  return themes[currentThemeKey];
}

const themes = {
  light: {
    title: "rgba(15,20,25,1.00)",
    subtitle: "rgba(91,112,131,1.00)",
    link: "rgb(29, 155, 240)",
    tile: "rgb(255, 255, 255)",
    border: "2px solid rgb(239, 243, 244)",
  },
  dim: {
    title: "rgba(231,233,234,1.00)",
    subtitle: "rgba(110,118,125,1.00)",
    link: "rgb(29, 155, 240)",
    tile: "#1c2b3b",
    border: "2px solid rgb(56, 68, 77)",
  },
  dark: {
    title: "rgba(231,233,234,1.00)",
    subtitle: "rgba(110,118,125,1.00)",
    link: "rgb(29, 155, 240)",
    tile: "#212121",
    border: "2px solid rgb(56, 68, 77)",
  },
};

const themeMap = {
  light: ["#FFFFFF", "rgb(255, 255, 255)"],
  dim: ["#15202B", "rgb(21, 32, 43)"],
  dark: ["#000000", "rgb(0, 0, 0)"],
};

function removeSpecialCharacters(s) {
  // This regex matches any character that isn't a letter, number, or _ and replaces it with an empty string
  return s.replace(/[^a-zA-Z0-9_]/g, "");
}

const locationSvg = `<svg fill="currentColor" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16px" height="16px" viewBox="0 0 395.71 395.71"
xml:space="preserve">
<g>
<path d="M197.849,0C122.131,0,60.531,61.609,60.531,137.329c0,72.887,124.591,243.177,129.896,250.388l4.951,6.738
 c0.579,0.792,1.501,1.255,2.471,1.255c0.985,0,1.901-0.463,2.486-1.255l4.948-6.738c5.308-7.211,129.896-177.501,129.896-250.388
 C335.179,61.609,273.569,0,197.849,0z M197.849,88.138c27.13,0,49.191,22.062,49.191,49.191c0,27.115-22.062,49.191-49.191,49.191
 c-27.114,0-49.191-22.076-49.191-49.191C148.658,110.2,170.734,88.138,197.849,88.138z"/>
</g>
</svg>`;

const moneySvg = `<svg fill="currentColor" width="16px" height="16px" viewBox="0 -1 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="Page-1" stroke="none" stroke-width="1" fill-rule="evenodd">
    <g id="Dribbble-Light-Preview" transform="translate(-300.000000, -2920.000000)">
        <g id="icons" transform="translate(56.000000, 160.000000)">
            <path d="M248,2764 L246,2764 L246,2760 L262,2760 L262,2764 L260,2764 L260,2762 L248,2762 L248,2764 Z M256,2772 C256,2773.105 255.105,2774 254,2774 C252.895,2774 252,2773.105 252,2772 C252,2770.895 252.895,2770 254,2770 C255.105,2770 256,2770.895 256,2772 L256,2772 Z M262,2769.657 L260.343,2768 L262,2768 L262,2769.657 Z M262,2776 L260.343,2776 L262,2774.343 L262,2776 Z M250.485,2776 L246.485,2772 L250.485,2768 L257.515,2768 L261.515,2772 L257.515,2776 L250.485,2776 Z M246,2776 L246,2774.343 L247.657,2776 L246,2776 Z M246,2768 L247.657,2768 L246,2769.657 L246,2768 Z M244,2778 L264,2778 L264,2766 L244,2766 L244,2778 Z" id="money-[#1183]">

</path>
        </g>
    </g>
</g>
</svg>`;
