const STORAGE_KEY = "supportdesk_tickets";

const sampleTickets = [
  {
    id: 1,
    title: "Unable to access client portal",
    client: "Acme Corporation",
    priority: "High",
    status: "Open",
    created_date: "2026-09-28"
  },
  {
    id: 2,
    title: "Invoice download not working",
    client: "Bright Solutions",
    priority: "Medium",
    status: "In Progress",
    created_date: "2026-09-27"
  },
  {
    id: 3,
    title: "Password reset request",
    client: "Nova Retail",
    priority: "Low",
    status: "Resolved",
    created_date: "2026-09-26"
  },
  {
    id: 4,
    title: "Dashboard loading slowly",
    client: "Vertex Labs",
    priority: "High",
    status: "In Progress",
    created_date: "2026-09-25"
  },
  {
    id: 5,
    title: "Update billing address",
    client: "GreenLeaf Foods",
    priority: "Low",
    status: "Open",
    created_date: "2026-09-24"
  },
  {
    id: 6,
    title: "Email notifications missing",
    client: "CloudNine Media",
    priority: "Medium",
    status: "Open",
    created_date: "2026-09-23"
  },
  {
    id: 7,
    title: "API integration error",
    client: "Orbit Systems",
    priority: "High",
    status: "Resolved",
    created_date: "2026-09-22"
  },
  {
    id: 8,
    title: "Request for user permissions",
    client: "Summit Finance",
    priority: "Medium",
    status: "Resolved",
    created_date: "2026-09-21"
  }
];

let tickets = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

if (!Array.isArray(tickets) || tickets.length === 0) {
  tickets = [...sampleTickets];
  saveTickets();
}

/* =========================
   DOM ELEMENTS
========================= */

const ticketsContainer = document.getElementById("tickets");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");
const sortSelect = document.getElementById("sortSelect");
const ticketCount = document.getElementById("ticketCount");

const totalCount = document.getElementById("totalCount");
const openCount = document.getElementById("openCount");
const progressCount = document.getElementById("progressCount");
const resolvedCount = document.getElementById("resolvedCount");

const detailsPanel = document.getElementById("detailsPanel");

const modal = document.getElementById("ticketModal");
const addTicketBtn = document.getElementById("addTicketBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const ticketForm = document.getElementById("ticketForm");

const titleInput = document.getElementById("titleInput");
const clientInput = document.getElementById("clientInput");
const priorityInput = document.getElementById("priorityInput");

const exportCsvBtn = document.getElementById("exportCsvBtn");


/* =========================
   LOCAL STORAGE
========================= */

function saveTickets() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}


/* =========================
   DASHBOARD STATS
========================= */

function updateStats() {
  totalCount.textContent = tickets.length;

  openCount.textContent =
    tickets.filter(ticket => ticket.status === "Open").length;

  progressCount.textContent =
    tickets.filter(ticket => ticket.status === "In Progress").length;

  resolvedCount.textContent =
    tickets.filter(ticket => ticket.status === "Resolved").length;
}


/* =========================
   PRIORITY SORTING
========================= */

function priorityRank(priority) {
  return {
    High: 3,
    Medium: 2,
    Low: 1
  }[priority] || 0;
}


/* =========================
   FILTER + SORT
========================= */

function getFilteredTickets() {
  const search = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;
  const priority = priorityFilter.value;
  const sort = sortSelect.value;

  let result = tickets.filter(ticket => {

    const matchesSearch =
      !search ||
      ticket.title.toLowerCase().includes(search) ||
      ticket.client.toLowerCase().includes(search);

    const matchesStatus =
      status === "all" || ticket.status === status;

    const matchesPriority =
      priority === "all" || ticket.priority === priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  result.sort((a, b) => {

    if (sort === "newest") {
      return new Date(b.created_date) -
             new Date(a.created_date);
    }

    if (sort === "oldest") {
      return new Date(a.created_date) -
             new Date(b.created_date);
    }

    if (sort === "priority") {
      return priorityRank(b.priority) -
             priorityRank(a.priority);
    }

    return 0;
  });

  return result;
}


/* =========================
   RENDER TICKETS
========================= */

function renderTickets() {

  const filteredTickets = getFilteredTickets();

  ticketCount.textContent =
    `${filteredTickets.length} ${
      filteredTickets.length === 1
        ? "ticket"
        : "tickets"
    }`;

  if (filteredTickets.length === 0) {

    ticketsContainer.innerHTML = `
      <div class="ticket">
        <h3>No tickets found</h3>
        <p>Try changing your search or filters.</p>
      </div>
    `;

    return;
  }

  ticketsContainer.innerHTML =
    filteredTickets.map(ticket => `

    <article class="ticket">

      <div class="ticket-top">

        <div>

          <h3>
            ${escapeHtml(ticket.title)}
          </h3>

          <p class="client">
            ${escapeHtml(ticket.client)}
          </p>

        </div>

        <button
          class="icon-delete"
          onclick="deleteTicket(${ticket.id})"
          title="Delete ticket">
          🗑
        </button>

      </div>


      <div class="ticket-meta">

        <span class="badge priority-${ticket.priority.toLowerCase()}">
          ${ticket.priority}
        </span>

        <span class="badge status-${ticket.status
          .toLowerCase()
          .replaceAll(" ", "-")}">
          ${ticket.status}
        </span>

      </div>


      <p class="created">
        Created: ${formatDate(ticket.created_date)}
      </p>


      <div class="ticket-actions">

        <select
          onchange="changeStatus(${ticket.id}, this.value)"
          aria-label="Change status">

          <option
            value="Open"
            ${ticket.status === "Open" ? "selected" : ""}>
            Open
          </option>

          <option
            value="In Progress"
            ${ticket.status === "In Progress" ? "selected" : ""}>
            In Progress
          </option>

          <option
            value="Resolved"
            ${ticket.status === "Resolved" ? "selected" : ""}>
            Resolved
          </option>

        </select>


        <select
          onchange="changePriority(${ticket.id}, this.value)"
          aria-label="Change priority">

          <option
            value="Low"
            ${ticket.priority === "Low" ? "selected" : ""}>
            Low
          </option>

          <option
            value="Medium"
            ${ticket.priority === "Medium" ? "selected" : ""}>
            Medium
          </option>

          <option
            value="High"
            ${ticket.priority === "High" ? "selected" : ""}>
            High
          </option>

        </select>


        <button
          class="secondary-btn"
          onclick="showDetails(${ticket.id})">
          View Details
        </button>

      </div>

    </article>

  `).join("");
}


/* =========================
   TICKET DETAILS
========================= */

function showDetails(id) {

  const ticket = tickets.find(
    ticket => ticket.id === id
  );

  if (!ticket) return;

  detailsPanel.innerHTML = `

    <div class="details-content">

      <span class="details-label">
        TICKET DETAILS
      </span>

      <h2>
        ${escapeHtml(ticket.title)}
      </h2>


      <div class="detail-row">

        <span>Client</span>

        <strong>
          ${escapeHtml(ticket.client)}
        </strong>

      </div>


      <div class="detail-row">

        <span>Priority</span>

        <select
          onchange="changePriority(${ticket.id}, this.value)">

          <option
            value="Low"
            ${ticket.priority === "Low" ? "selected" : ""}>
            Low
          </option>

          <option
            value="Medium"
            ${ticket.priority === "Medium" ? "selected" : ""}>
            Medium
          </option>

          <option
            value="High"
            ${ticket.priority === "High" ? "selected" : ""}>
            High
          </option>

        </select>

      </div>


      <div class="detail-row">

        <span>Status</span>

        <select
          onchange="changeStatus(${ticket.id}, this.value)">

          <option
            value="Open"
            ${ticket.status === "Open" ? "selected" : ""}>
            Open
          </option>

          <option
            value="In Progress"
            ${ticket.status === "In Progress" ? "selected" : ""}>
            In Progress
          </option>

          <option
            value="Resolved"
            ${ticket.status === "Resolved" ? "selected" : ""}>
            Resolved
          </option>

        </select>

      </div>


      <div class="detail-row">

        <span>Created</span>

        <strong>
          ${formatDate(ticket.created_date)}
        </strong>

      </div>

    </div>

  `;
}


/* =========================
   CHANGE STATUS
========================= */

function changeStatus(id, status) {

  const ticket = tickets.find(
    ticket => ticket.id === id
  );

  if (!ticket) return;

  ticket.status = status;

  saveTickets();
  updateStats();
  renderTickets();
  showDetails(id);
}


/* =========================
   CHANGE PRIORITY
========================= */

function changePriority(id, priority) {

  const ticket = tickets.find(
    ticket => ticket.id === id
  );

  if (!ticket) return;

  ticket.priority = priority;

  saveTickets();
  renderTickets();
  showDetails(id);
}


/* =========================
   DELETE TICKET
========================= */

function deleteTicket(id) {

  const ticket = tickets.find(
    ticket => ticket.id === id
  );

  if (!ticket) return;

  const confirmed = confirm(
    `Delete "${ticket.title}"?`
  );

  if (!confirmed) return;

  tickets = tickets.filter(
    ticket => ticket.id !== id
  );

  saveTickets();
  updateStats();
  renderTickets();

  detailsPanel.innerHTML = `

    <div class="empty-details">

      <h3>
        Select a ticket
      </h3>

      <p>
        Click a ticket to view its details.
      </p>

    </div>

  `;
}


/* =========================
   ADD TICKET MODAL
========================= */

function openModal() {

  modal.classList.remove("hidden");

  titleInput.focus();
}


function closeModal() {

  modal.classList.add("hidden");

  ticketForm.reset();

  priorityInput.value = "Medium";
}


/* =========================
   CREATE NEW TICKET
========================= */

ticketForm.addEventListener(
  "submit",
  event => {

    event.preventDefault();

    const title =
      titleInput.value.trim();

    const client =
      clientInput.value.trim();


    /* Validation */

    if (!title) {

      alert("Please enter a ticket title.");

      titleInput.focus();

      return;
    }


    if (!client) {

      alert("Please enter a client name.");

      clientInput.focus();

      return;
    }


    const newTicket = {

      id: Date.now(),

      title,

      client,

      priority:
        priorityInput.value,

      status:
        "Open",

      created_date:
        new Date()
          .toISOString()
          .split("T")[0]
    };


    tickets.unshift(newTicket);

    saveTickets();

    updateStats();

    renderTickets();

    closeModal();

    showDetails(newTicket.id);

  }
);


/* =========================
   MODAL EVENTS
========================= */

addTicketBtn.addEventListener(
  "click",
  openModal
);


closeModalBtn.addEventListener(
  "click",
  closeModal
);


modal.addEventListener(
  "click",
  event => {

    if (event.target === modal) {
      closeModal();
    }

  }
);


/* =========================
   SEARCH + FILTER EVENTS
========================= */

searchInput.addEventListener(
  "input",
  renderTickets
);


statusFilter.addEventListener(
  "change",
  renderTickets
);


priorityFilter.addEventListener(
  "change",
  renderTickets
);


sortSelect.addEventListener(
  "change",
  renderTickets
);


/* =========================
   EXPORT TICKETS TO CSV
========================= */

if (exportCsvBtn) {

  exportCsvBtn.addEventListener(
    "click",
    exportTicketsToCSV
  );

}


function exportTicketsToCSV() {

  if (tickets.length === 0) {

    alert("No tickets available to export.");

    return;
  }


  const headers = [
    "Title",
    "Client",
    "Priority",
    "Status",
    "Created Date"
  ];


  const rows = tickets.map(ticket => [

    ticket.title,

    ticket.client,

    ticket.priority,

    ticket.status,

    ticket.created_date

  ]);


  const csvContent = [

    headers,

    ...rows

  ]

    .map(row =>
      row
        .map(value =>
          `"${String(value)
            .replaceAll('"', '""')}"`
        )
        .join(",")
    )

    .join("\n");


  const blob = new Blob(
    [csvContent],
    {
      type: "text/csv;charset=utf-8;"
    }
  );


  const url =
    URL.createObjectURL(blob);


  const downloadLink =
    document.createElement("a");


  downloadLink.href = url;

  downloadLink.download =
    "support-tickets.csv";


  document.body.appendChild(
    downloadLink
  );


  downloadLink.click();


  document.body.removeChild(
    downloadLink
  );


  URL.revokeObjectURL(url);

}


/* =========================
   DATE FORMAT
========================= */

function formatDate(dateString) {

  return new Date(
    dateString + "T00:00:00"
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}


/* =========================
   HTML SECURITY
========================= */

function escapeHtml(value) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================
   INITIAL LOAD
========================= */

updateStats();

renderTickets();