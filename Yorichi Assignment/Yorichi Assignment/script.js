let username = "";
let per_page = 10;
let current_page = 1;
let total_repos = 0;

window.onload = () => {
  init();
};

async function init() {
  if (username) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("username", username);
    window.history.pushState({}, "", "?" + urlParams.toString());
    const body = document.querySelector("body");
    for (let i = 0; i < body.children.length; i++) {
      const child = body.children[i];
      child.classList.remove("hide");
    }
    document.querySelector(".warning_no_username").classList.add("hide");
    return getUserInfo();
  }

  const urlParams = new URLSearchParams(window.location.search);
  const usernameFromParams = urlParams.get("username");
  if (!usernameFromParams) {
    const body = document.querySelector("body");
    for (let i = 0; i < body.children.length; i++) {
      const child = body.children[i];
      child.classList.add("hide");
    }
    document.querySelector(".warning_no_username").classList.remove("hide");
    return;
  }

  const body = document.querySelector("body");
  for (let i = 0; i < body.children.length; i++) {
    const child = body.children[i];
    child.classList.remove("hide");
  }
  document.querySelector(".warning_no_username").classList.add("hide");

  username = usernameFromParams;
  return getUserInfo();
}

async function selectUsername(event) {
  event.preventDefault();
  const usernameField = document.getElementById("username_field").value;
  console.log(usernameField);
  if (!usernameField) return;

  const reposPerPage = document.getElementById("repos_per_page").value;
  per_page = +reposPerPage || 10;
  username = usernameField;
  init();
  return false;
}

async function getUserInfo() {
  const userInfo = await fetch(`https://api.github.com/users/${username}`).then(
    (res) => res.json()
  );
  const {
    name,
    html_url,
    avatar_url,
    location,
    bio,
    twitter_username,
    public_repos,
  } = userInfo;
  total_repos = public_repos;
  document.getElementById("username").innerHTML = name;
  document.getElementById("user_github_url").innerHTML = html_url;
  document.getElementById("avatar").src = avatar_url;
  document.getElementById("user_location").innerHTML = location;
  document.getElementById("user_bio").innerHTML = bio;
  document.getElementById(
    "user_twitter"
  ).innerHTML = `Twitter: ${twitter_username}`;

  displayPageNumbers();
  const userRepos = await getUserRepos();
}

function getTotalPages() {
  return Math.ceil(total_repos / per_page);
}

async function getUserRepos() {
  const userRepos = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=${per_page}&page=${current_page}`
  ).then((res) => res.json());

  const reposList = document.querySelector(".repositories_container");

  userRepos.forEach(async (repo) => {
    const r = await getRepoColumn(repo.name, repo.description);
    reposList.appendChild(r);
  });
}

async function getRepoColumn(repositoryName, repositoryDescription) {
  const repoColumn = document.createElement("div");

  repoColumn.classList.add("repository-column");

  const repoName = document.createElement("h2");
  repoName.innerHTML = repositoryName;
  repoColumn.appendChild(repoName);

  const repoDescription = document.createElement("div");
  repoDescription.innerHTML = repositoryDescription;
  repoColumn.appendChild(repoDescription);

  const repoLanguages = document.createElement("div");
  repoLanguages.classList.add("repository_languages");
  repoColumn.appendChild(repoLanguages);

  const languages = await getLanguagesForRepo(repositoryName);

  languages.forEach((lang) => {
    const language = document.createElement("div");
    language.classList.add("repository_language");
    language.innerHTML = lang;
    repoLanguages.appendChild(language);
  });

  return repoColumn;
}

async function displayPageNumbers() {
  const paginationController = document.querySelector(".paginator_controller");
  for (let i = 1; i <= getTotalPages(); i++) {
    const pageButton = document.createElement("button");
    pageButton.innerHTML = i;
    pageButton.onclick = function () {
      selectPage(i);
    };
    paginationController.appendChild(pageButton);
  }
}

function selectPage(page_number) {
  if (page_number < 1 || page_number > getTotalPages()) return;
  const parent = document.querySelector(".repositories_container");
  while (parent.firstChild) parent.removeChild(parent.firstChild);
  current_page = page_number;
  getUserRepos();
}

function previousPage() {
  selectPage(current_page - 1);
}
function nextPage() {
  selectPage(current_page + 1);
}
async function getLanguagesForRepo(repoName) {
  const languages = Object.keys(
    await fetch(
      `https://api.github.com/repos/${username}/${repoName}/languages`
    ).then((res) => res.json())
  );

  return languages;
}
