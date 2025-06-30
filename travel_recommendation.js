let searchbtn = document.getElementById("searchbtn");
let clearbtn = document.getElementById("clearbtn");
let result = document.getElementById("resultContainer");
let mydiv = document.getElementById("dropdown");
let close = document.getElementById("close-btn");
let query = document.getElementById("searchinput");
let form = document.getElementById("contact-us-form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  form.reset();
});

const clearsearch = () => {
  query.value = "";
  mydiv.style.display = "none";
};
clearbtn.addEventListener("click", clearsearch);

const closeDropdown = () => {
  mydiv.style.display = "none";
  query.value = "";
};
close.addEventListener("click", closeDropdown);

const searchError = () => {
  mydiv.style.display = "block";
  result.innerHTML = `<p class="notfound">Sorry, we can't find your search</p>`;
};

const timeZoneMap = {
  USA: "America/New_York",
  India: "Asia/Kolkata",
  Japan: "Asia/Tokyo",
  France: "Europe/Paris",
  Australia: "Australia/Sydney",
  Brazil: "America/Sao_Paulo",
};

fetch("travel_recommendation_api.json")
  .then((res) => res.json())
  .then((data) => {
    // utility to singularize broad keywords
    const singularize = (str) =>
      str.replace(/ies$/, "y").replace(/es$/, "").replace(/s$/, "");

    // renders an array of result-objects into the dropdown
    const displayResults = (items, category) => {
      mydiv.style.display = "block";
      result.innerHTML = ""; // clear previous

      items.forEach((item) => {
        // if this is a country record, show local time
        let timeHtml = "";
        if (category === "country") {
          // assume item.name is the country name
          const tz = timeZoneMap[item.name] || "UTC";
          const opts = {
            timeZone: tz,
            hour12: true,
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
          };
          const now = new Date().toLocaleTimeString("en-US", opts);
          timeHtml = `<p class="time">Local time: ${now}</p>`;

          item.cities.forEach((item) => {
            result.innerHTML += `
        <div class="result-item">
        <h2 class="title">${item.name}</h2>
        <img
        class="search-img"
        src="${item.imageUrl}"
        alt="${item.name}"
        />
        <p class="description">${item.description}</p>
        ${timeHtml}
        </div>
        `;
          });
        } else {
          result.innerHTML += `
          <div class="result-item">
          <h2 class="title">${item.name}</h2>
          <img
          class="search-img"
          src="${item.imageUrl}"
          alt="${item.name}"
          />
          <p class="description">${item.description}</p>
          ${timeHtml}
          </div>
          `;
        }
      });
    };

    const search = () => {
      const raw = query.value.trim().toLowerCase();
      const norm = singularize(raw);
      let items = [];
      let cat = null;

      // Task 8: broad‐category matches
      if (norm === "beach" || norm === "beaches") {
        items = data.beaches;
        cat = "beach";
      } else if (norm === "temple" || norm === "temples") {
        items = data.temples;
        cat = "temple";
      } else if (norm === "country" || norm === "countries") {
        // Task 10: we assume your JSON's country objects
        // now include imageUrl, description, AND timeZone
        items = data.countries;
        cat = "country";
      } else {
        // Task 7: specific‐name matches
        cat = "specific";
        data.beaches.forEach((b) => {
          if (b.name.toLowerCase().includes(raw)) items.push(b);
        });
        data.temples.forEach((t) => {
          if (t.name.toLowerCase().includes(raw)) items.push(t);
        });
        data.countries.forEach((c) => {
          if (c.cities) {
            c.cities.forEach((city) => {
              if (city.name.toLowerCase().includes(raw)) {
                // carry through a timezone if the country had one
                items.push({
                  ...city,
                  timeZone: c.timeZone,
                });
              }
            });
          }
        });
      }

      items.length ? displayResults(items, cat) : searchError();
    };

    searchbtn.addEventListener("click", search);
  })
  .catch(() => searchError());
