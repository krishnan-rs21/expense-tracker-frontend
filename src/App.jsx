import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileClock,
  FilePlus2,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Pencil,
  Plus,
  ReceiptText,
  ShieldCheck,
  SlidersHorizontal,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import {
  addMoney,
  api,
  initials,
  money,
  roleLabel,
  shortDate,
  statusLabel,
  toPaise,
} from "./api.js";

const SESSION_KEY = "expense-service-session";
const STATUS_OPTIONS = [
  ["", "All statuses"],
  ["pending_manager", "Waiting for manager"],
  ["pending_accounts", "Waiting for accounts"],
  ["approved", "Approved"],
  ["rejected", "Rejected"],
  ["cancelled", "Cancelled"],
];

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function Brand({ inverse = false }) {
  return (
    <Link
      className={`brand ${inverse ? "brand-inverse" : ""}`}
      to="/requests"
      aria-label="Fieldnote home"
    >
      <span className="brand-symbol">
        <ReceiptText size={19} strokeWidth={2.2} />
      </span>
      <span className="brand-name">
        fieldnote<span>.</span>
      </span>
    </Link>
  );
}

function Alert({ children, tone = "error" }) {
  if (!children) return null;
  return (
    <div
      className={`alert alert-${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {tone === "error" ? (
        <CircleAlert size={17} />
      ) : (
        <CheckCircle2 size={17} />
      )}
      <span>{children}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const icon = status?.startsWith("pending") ? (
    <Clock3 size={13} />
  ) : status === "approved" ? (
    <Check size={13} />
  ) : status === "rejected" ? (
    <X size={13} />
  ) : (
    <span className="status-dot" />
  );
  return (
    <span className={`status-badge status-${status}`}>
      {icon}
      {statusLabel(status)}
    </span>
  );
}

function App() {
  const [session, setSession] = useState(readSession);

  function onLogin(nextSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }

  function onLogout() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            session ? (
              <Navigate to="/requests" replace />
            ) : (
              <LoginPage onLogin={onLogin} />
            )
          }
        />
        <Route
          element={<RequireSession session={session} onLogout={onLogout} />}
        >
          <Route index element={<Navigate to="/requests" replace />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="requests/new" element={<RequestFormPage />} />
          <Route path="requests/:id/edit" element={<RequestFormPage />} />
          <Route path="requests/:id" element={<RequestDetailPage />} />
          <Route path="approvals" element={<ApprovalsPage />} />
          <Route path="projects" element={<ProjectSummaryPage />} />
          <Route path="*" element={<Navigate to="/requests" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await api("/auth/login", {
        method: "POST",
        body: { email: email.trim(), password },
      });
      onLogin(result);
      navigate("/requests", { replace: true });
    } catch (cause) {
      setError(
        cause.status === 401
          ? "That email and password don't match. Check them and try again."
          : cause.message,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-art" aria-label="Fieldnote Expense Service">
        <div className="login-art-top">
          <Brand inverse />
          <span className="edition-label">PROJECT FINANCE / 01</span>
        </div>
        <div className="login-copy">
          <span className="eyebrow eyebrow-light">
            A clearer view of every rupee
          </span>
          <h1>
            Good work
            <br />
            runs on <em>good records.</em>
          </h1>
          <p>
            Track project spend, move requests forward, and keep every approval
            in view.
          </p>
        </div>
        <div className="login-art-footer">
          <div className="art-ledger" aria-hidden="true">
            <div className="ledger-top">
              <span>ACTIVE PROJECTS</span>
              <span>03 / 03</span>
            </div>
            <div className="ledger-bars">
              <i />
              <i />
              <i />
            </div>
            <div className="ledger-bottom">
              <span>FIELDNOTE / EXPENSE SERVICE</span>
              <span>08:42 AM</span>
            </div>
          </div>
          <span className="login-copyright">
            BUILT FOR THE PEOPLE WHO BUILD
          </span>
        </div>
        <span className="art-index" aria-hidden="true">
          F / 01
        </span>
      </section>
      <section className="login-panel">
        <div className="login-mobile-brand">
          <Brand />
        </div>
        <div className="login-form-wrap">
          <span className="eyebrow">WORKSPACE ACCESS</span>
          <h2>Welcome back.</h2>
          <p className="muted-copy">
            Sign in to continue to your expense workspace.
          </p>
          <form className="login-form" onSubmit={submit}>
            <label className="field-label" htmlFor="login-email">
              Work email
            </label>
            <input
              id="login-email"
              className="text-input"
              type="email"
              autoComplete="username"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <label
              className="field-label password-label"
              htmlFor="login-password"
            >
              Password
            </label>
            <input
              id="login-password"
              className="text-input"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <Alert>{error}</Alert>
            <button
              className="button button-primary login-submit"
              type="submit"
              disabled={busy}
            >
              {busy ? "Signing in…" : "Sign in"}
              <ArrowRight size={17} />
            </button>
          </form>
          <p className="login-hint">
            <ShieldCheck size={15} /> Your workspace is secured with encrypted
            sign-in.
          </p>
        </div>
        <span className="login-panel-foot">
          FIELDNOTE EXPENSE SERVICE <span>·</span> V1.0
        </span>
      </section>
    </main>
  );
}

function RequireSession({ session, onLogout }) {
  const location = useLocation();
  if (!session?.token || !session?.user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return (
    <AppShell session={session} onLogout={onLogout}>
      <Outlet context={session} />
    </AppShell>
  );
}

function AppShell({ session, onLogout, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const user = session.user;
  const canReview = ["manager", "accounts"].includes(user.role);
  const pageTitle = location.pathname.startsWith("/approvals")
    ? "Approval queue"
    : location.pathname.startsWith("/projects")
      ? "Project summary"
      : location.pathname.includes("/new") ||
          location.pathname.endsWith("/edit")
        ? "Request details"
        : location.pathname.match(/^\/requests\/\d+/)
          ? "Request detail"
          : "My requests";

  return (
    <div className="app-shell">
      {menuOpen && (
        <button
          className="mobile-scrim"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-head">
          <Brand inverse />
          <button
            className="icon-button mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>
        <div className="workspace-switcher">
          <div className="workspace-mark">T</div>
          <div className="workspace-meta">
            <strong>Technopark Works</strong>
            <span>Finance workspace</span>
          </div>
          <ChevronDown size={15} />
        </div>
        <span className="nav-caption">WORKSPACE</span>
        <nav className="side-nav" aria-label="Main navigation">
          <NavLink
            to="/requests"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `nav-link ${isActive && location.pathname === "/requests" ? "nav-active" : ""}`
            }
          >
            <ListChecks size={18} />
            <span>My requests</span>
            <ChevronRight className="nav-chevron" size={15} />
          </NavLink>
          {canReview && (
            <NavLink
              to="/approvals"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-active" : ""}`
              }
            >
              <ShieldCheck size={18} />
              <span>Approvals</span>
              <ChevronRight className="nav-chevron" size={15} />
            </NavLink>
          )}
          {canReview && (
            <NavLink
              to="/projects"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-active" : ""}`
              }
            >
              <FolderKanban size={18} />
              <span>Projects</span>
              <ChevronRight className="nav-chevron" size={15} />
            </NavLink>
          )}
        </nav>
        <div className="sidebar-note">
          <span className="sidebar-note-icon">
            <BriefcaseBusiness size={17} />
          </span>
          <div>
            <strong>Project operations</strong>
            <p>Funding, requests, and approvals in one place.</p>
          </div>
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <span className="avatar">{initials(user.name)}</span>
            <span className="user-lines">
              <strong>{user.name}</strong>
              <small>{roleLabel(user.role)}</small>
            </span>
            <button
              className="icon-button logout-button"
              onClick={onLogout}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
          <div className="sidebar-foot">
            <span>EXPENSE SERVICE</span>
            <span>LOCAL / 01</span>
          </div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-button menu-trigger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumb">
            <span>WORKSPACE</span>
            <ChevronRight size={13} />
            <strong>{pageTitle}</strong>
          </div>
          <div className="topbar-right">
            <span className="connection-dot" />
            <span>Expense Service</span>
            <span className="topbar-divider" />
            <span className="topbar-date">
              {new Intl.DateTimeFormat("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date())}
            </span>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="heading-action">{action}</div>}
    </div>
  );
}

function RequestsPage() {
  const { token } = useOutletContext();
  const [status, setStatus] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api(`/requests${status ? `?status=${encodeURIComponent(status)}` : ""}`, {
      token,
    })
      .then((items) => {
        if (active) setRequests(items);
      })
      .catch((cause) => {
        if (active) setError(cause.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [status, token]);

  const pendingCount = requests.filter((request) =>
    request.status.startsWith("pending"),
  ).length;
  return (
    <>
      <PageHeading
        eyebrow="REQUESTS / OVERVIEW"
        title="My requests"
        description="Track every project expense from submission through approval."
        action={
          <Link className="button button-primary" to="/requests/new">
            <Plus size={17} /> New request
          </Link>
        }
      />
      <div className="overview-strip">
        <div className="overview-copy">
          <span className="overview-mark">
            <FileClock size={19} />
          </span>
          <div>
            <strong>
              {pendingCount
                ? `${pendingCount} request${pendingCount === 1 ? "" : "s"} in review`
                : "Your request ledger"}
            </strong>
            <span>
              {pendingCount
                ? "The approval flow is moving."
                : "Your requests, all in one place."}
            </span>
          </div>
        </div>
        <div className="overview-total">
          <span>SHOWING</span>
          <strong>
            {requests.length.toString().padStart(2, "0")}{" "}
            <small>REQUESTS</small>
          </strong>
        </div>
      </div>
      <section className="surface request-surface">
        <div className="surface-toolbar">
          <div className="section-title">
            <h2>Request ledger</h2>
            <span className="count-pill">{requests.length}</span>
          </div>
          <label className="filter-control">
            <SlidersHorizontal size={15} />
            <span className="sr-only">Filter by status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {STATUS_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>
        </div>
        <div className="request-table-head">
          <span>REQUEST / PROJECT</span>
          <span>SUBMITTED</span>
          <span>AMOUNT</span>
          <span>STATUS</span>
          <span />
        </div>
        {loading ? (
          <div className="loading-block">
            <span className="spinner" />
            Loading requests
          </div>
        ) : error ? (
          <div className="surface-message">
            <Alert>{error}</Alert>
          </div>
        ) : requests.length ? (
          <div className="request-list">
            {requests.map((request) => (
              <Link
                className="request-row"
                to={`/requests/${request.id}`}
                key={request.id}
              >
                <span className="request-primary">
                  <span className="request-icon">
                    <ReceiptText size={18} />
                  </span>
                  <span>
                    <strong>{request.category}</strong>
                    <small>
                      {request.projectName} <span>·</span> #
                      {String(request.id).padStart(4, "0")}
                    </small>
                  </span>
                </span>
                <span className="request-date">
                  {shortDate(request.createdAt)}
                </span>
                <strong className="request-amount">
                  {money(request.amount)}
                </strong>
                <StatusBadge status={request.status} />
                <ChevronRight className="row-chevron" size={17} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">
              <FilePlus2 size={24} />
            </span>
            <h3>No requests here yet</h3>
            <p>Start with a project expense and follow it through approval.</p>
            <Link className="button button-secondary" to="/requests/new">
              <Plus size={16} /> Create a request
            </Link>
          </div>
        )}
      </section>
      <p className="page-footnote">
        <ShieldCheck size={14} /> Your request list is private to your account.
      </p>
    </>
  );
}

function FieldError({ children }) {
  return children ? (
    <span className="field-error">
      <CircleAlert size={13} />
      {children}
    </span>
  ) : null;
}

function RequestFormPage() {
  const { token } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      api("/projects", { token }),
      editing ? api(`/requests/${id}`, { token }) : Promise.resolve(null),
    ])
      .then(([projectItems, request]) => {
        if (!active) return;
        setProjects(projectItems);
        if (request) {
          setProjectId(String(request.projectId));
          const presetCategories = [
            "Materials",
            "Labour",
            "Transport",
            "Equipment rental",
          ];
          if (presetCategories.includes(request.category)) {
            setCategory(request.category);
          } else {
            setCategory("Other");
          }
          setAmount(String(request.amount));
          setDescription(request.description);
        } else if (projectItems[0]) {
          setProjectId(String(projectItems[0].id));
        }
      })
      .catch((cause) => {
        if (active) setPageError(cause.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [editing, id, token]);

  const selectedProject = projects.find(
    (project) => String(project.id) === projectId,
  );
  const amountPaise = toPaise(amount);
  const remainingPaise = selectedProject
    ? toPaise(selectedProject.remaining)
    : null;
  const overBudget =
    amountPaise !== null &&
    remainingPaise !== null &&
    amountPaise > remainingPaise;

  function validate() {
    const next = {};
    if (!projectId) next.projectId = "Choose a project for this request.";
    if (!category) next.category = "Choose a category.";
    if (amountPaise === null || amountPaise <= 0n || amountPaise > 50000000n)
      next.amount =
        "Enter an amount above ₹0 and at most ₹5,00,000, with up to 2 decimal places.";
    if (description.trim().length < 10)
      next.description = "Description must be at least 10 characters.";
    setErrors(next);
    setTouched({
      projectId: true,
      category: true,
      amount: true,
      description: true,
    });
    return Object.keys(next).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    setPageError("");
    if (!validate()) return;
    setBusy(true);
    try {
      const payload = {
        category,
        amount: amount.trim(),
        description: description.trim(),
      };
      if (!editing) payload.projectId = Number(projectId);
      const result = await api(editing ? `/requests/${id}` : "/requests", {
        token,
        method: editing ? "PATCH" : "POST",
        body: payload,
      });
      navigate(`/requests/${result.id}`, { replace: true });
    } catch (cause) {
      setPageError(cause.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading)
    return (
      <div className="loading-block page-loading">
        <span className="spinner" />
        Loading request form
      </div>
    );
  return (
    <>
      <PageHeading
        eyebrow={editing ? "REQUESTS / EDIT" : "REQUESTS / NEW"}
        title={editing ? "Edit request" : "New request"}
        description={
          editing
            ? "Make changes before the request enters review."
            : "Add the details your project reviewer needs."
        }
      />
      {pageError && <Alert>{pageError}</Alert>}
      <form className="form-layout" onSubmit={submit} noValidate>
        <section className="surface form-surface">
          <div className="form-section-head">
            <span className="step-number">01</span>
            <div>
              <h2>Expense details</h2>
              <p>Use a clear category and a useful description.</p>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-field form-field-wide">
              <label htmlFor="projectId">
                Project <span className="required-mark">*</span>
              </label>
              <select
                id="projectId"
                className="form-input"
                value={projectId}
                disabled={editing}
                onChange={(event) => setProjectId(event.target.value)}
                onBlur={() =>
                  setTouched((value) => ({ ...value, projectId: true }))
                }
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} · {money(project.remaining)} remaining
                  </option>
                ))}
              </select>
              {touched.projectId && <FieldError>{errors.projectId}</FieldError>}
              {selectedProject && (
                <div className="project-budget-hint">
                  <span className="budget-hint-icon">
                    <Wallet size={15} />
                  </span>
                  <span>
                    <small>REMAINING BUDGET</small>
                    <strong>{money(selectedProject.remaining)}</strong>
                  </span>
                  <span className="hint-budget-total">
                    of {money(selectedProject.budget)}
                  </span>
                </div>
              )}
            </div>
            <div className="form-field">
              <label htmlFor="category">
                Category <span className="required-mark">*</span>
              </label>
              <select
                id="category"
                className="form-input"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                onBlur={() =>
                  setTouched((value) => ({ ...value, category: true }))
                }
              >
                <option value="">Choose a category</option>
                {[
                  "Materials",
                  "Labour",
                  "Transport",
                  "Equipment rental",
                  "Other",
                ].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              {touched.category && <FieldError>{errors.category}</FieldError>}
            </div>
            <div className="form-field">
              <label htmlFor="amount">
                Amount <span className="required-mark">*</span>
              </label>
              <div className="amount-input-wrap">
                <span>₹</span>
                <input
                  id="amount"
                  className="form-input amount-input"
                  type="number"
                  min="0.01"
                  max="500000"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  onBlur={() =>
                    setTouched((value) => ({ ...value, amount: true }))
                  }
                />
              </div>
              {touched.amount && <FieldError>{errors.amount}</FieldError>}
              {overBudget && (
                <span className="field-warning">
                  <CircleAlert size={13} />
                  This is higher than the project's remaining budget.
                </span>
              )}
            </div>
            <div className="form-field form-field-wide">
              <label htmlFor="description">
                Description <span className="required-mark">*</span>
              </label>
              <textarea
                id="description"
                className="form-input form-textarea"
                rows="4"
                maxLength="1000"
                placeholder="What is this expense for? Include the details a reviewer needs."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                onBlur={() =>
                  setTouched((value) => ({ ...value, description: true }))
                }
              />
              <div className="field-under-row">
                {touched.description ? (
                  <FieldError>{errors.description}</FieldError>
                ) : (
                  <span className="field-helper">
                    Keep it specific and easy to verify.
                  </span>
                )}
                <span className="character-count">
                  {description.length}/1000
                </span>
              </div>
            </div>
          </div>
          <div className="form-actions">
            <Link
              className="button button-quiet"
              to={editing ? `/requests/${id}` : "/requests"}
            >
              Cancel
            </Link>
            <button className="button button-primary" disabled={busy}>
              {busy ? "Saving…" : editing ? "Save changes" : "Submit request"}
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
        <aside className="form-aside">
          <div className="surface workflow-card">
            <span className="aside-icon">
              <FileClock size={19} />
            </span>
            <span className="eyebrow">WHAT HAPPENS NEXT</span>
            <h3>{editing ? "Back to review" : "A clear review path"}</h3>
            <ol className="workflow-list">
              <li>
                <span>1</span>
                <div>
                  <strong>Manager review</strong>
                  <small>Checks the project need and amount.</small>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Accounts review</strong>
                  <small>Confirms funds before approval.</small>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Request closed</strong>
                  <small>You'll see every step in the timeline.</small>
                </div>
              </li>
            </ol>
          </div>
          {selectedProject && (
            <div className="form-budget-note">
              <span className="budget-note-top">
                <Banknote size={17} /> PROJECT BALANCE
              </span>
              <strong>{money(selectedProject.remaining)}</strong>
              <span>available on {selectedProject.name}</span>
            </div>
          )}
        </aside>
      </form>
    </>
  );
}

function RequestDetailPage() {
  const { token, user } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [actionError, setActionError] = useState("");

  async function refresh() {
    const data = await api(`/requests/${id}`, { token });
    setRequest(data);
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    api(`/requests/${id}`, { token })
      .then((data) => {
        if (active) setRequest(data);
      })
      .catch((cause) => {
        if (active) setError(cause.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, token]);

  if (loading)
    return (
      <div className="loading-block page-loading">
        <span className="spinner" />
        Loading request
      </div>
    );
  if (error)
    return (
      <>
        <Link className="back-link" to="/requests">
          ← Back to requests
        </Link>
        <Alert>{error}</Alert>
      </>
    );
  if (!request) return null;

  const isOwner = Number(request.raisedBy.id) === Number(user.id);
  const canEdit = isOwner && request.status === "pending_manager";
  const canCancel = isOwner && request.status === "pending_manager";
  const canReview =
    !isOwner &&
    ((user.role === "manager" && request.status === "pending_manager") ||
      (user.role === "accounts" && request.status === "pending_accounts"));

  async function performAction(action, payload = {}) {
    setActionBusy(true);
    setActionError("");
    try {
      await api(`/requests/${id}/${action}`, {
        token,
        method: "POST",
        body: payload,
      });
      setRejectOpen(false);
      setReason("");
      await refresh();
    } catch (cause) {
      setActionError(cause.message);
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <>
      <Link className="back-link" to="/requests">
        <ArrowDownRight size={15} /> Back to requests
      </Link>
      <div className="detail-heading">
        <div>
          <span className="eyebrow">
            REQUEST / #{String(request.id).padStart(4, "0")}
          </span>
          <h1>{request.category}</h1>
          <p>
            {request.projectName} <span>·</span> Submitted{" "}
            {shortDate(request.createdAt, { withTime: true })}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>
      <div className="detail-grid">
        <div className="detail-main">
          <section className="surface detail-card">
            <div className="detail-card-head">
              <div>
                <span className="eyebrow">REQUEST SUMMARY</span>
                <h2>Expense details</h2>
              </div>
              <ReceiptText size={19} />
            </div>
            <div className="detail-amount">
              <span>REQUESTED AMOUNT</span>
              <strong>{money(request.amount)}</strong>
            </div>
            <div className="detail-info-grid">
              <div>
                <span>PROJECT</span>
                <strong>{request.projectName}</strong>
              </div>
              <div>
                <span>CATEGORY</span>
                <strong>{request.category}</strong>
              </div>
              <div className="detail-description">
                <span>DESCRIPTION</span>
                <p>{request.description}</p>
              </div>
            </div>
          </section>
          <section className="surface history-card">
            <div className="detail-card-head">
              <div>
                <span className="eyebrow">AUDIT TRAIL</span>
                <h2>Request history</h2>
              </div>
              <span className="count-pill">{request.history.length}</span>
            </div>
            {request.history.length ? (
              <ol className="history-list">
                {request.history.map((entry) => (
                  <li className="history-item" key={entry.id}>
                    <span
                      className={`history-marker history-${entry.toStatus || "neutral"}`}
                    >
                      {entry.toStatus === "approved" ? (
                        <Check size={14} />
                      ) : entry.toStatus === "rejected" ? (
                        <X size={14} />
                      ) : (
                        <Clock3 size={14} />
                      )}
                    </span>
                    <div className="history-entry">
                      <div className="history-title-row">
                        <strong>{historyTitle(entry)}</strong>
                        <time>
                          {shortDate(entry.createdAt, { withTime: true })}
                        </time>
                      </div>
                      <p>
                        {entry.actorName}
                        {entry.toStatus ? (
                          <>
                            {" "}
                            moved it to <StatusBadge status={entry.toStatus} />
                          </>
                        ) : (
                          " created this request"
                        )}
                      </p>
                      {entry.reason && (
                        <blockquote>“{entry.reason}”</blockquote>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="empty-history">No history has been recorded.</div>
            )}
          </section>
        </div>
        <aside className="detail-aside">
          <section className="surface requester-card">
            <span className="eyebrow">RAISED BY</span>
            <div className="requester-identity">
              <span className="avatar avatar-large">
                {initials(request.raisedBy.name)}
              </span>
              <span>
                <strong>{request.raisedBy.name}</strong>
                <small>{roleLabel(request.raisedBy.role)}</small>
              </span>
            </div>
            <div className="requester-email">{request.raisedBy.email}</div>
          </section>
          <section className="surface action-card">
            <span className="eyebrow">ACTIONS</span>
            <h3>
              {canReview
                ? "Review this request"
                : canEdit
                  ? "Still in your hands"
                  : "Request status"}
            </h3>
            <p>
              {canReview
                ? "Check the details, then move this request forward or return it with a reason."
                : canCancel
                  ? "You can make changes or cancel while the request is waiting for review."
                  : "This request can no longer be changed."}
            </p>
            {actionError && <Alert>{actionError}</Alert>}
            <div className="action-buttons">
              {canEdit && (
                <Link
                  className="button button-secondary button-full"
                  to={`/requests/${id}/edit`}
                >
                  <Pencil size={16} /> Edit request
                </Link>
              )}
              {canCancel && (
                <button
                  className="button button-danger-outline button-full"
                  onClick={() => performAction("cancel")}
                  disabled={actionBusy}
                >
                  <XCircle size={16} /> Cancel request
                </button>
              )}
              {canReview && (
                <>
                  <button
                    className="button button-primary button-full"
                    onClick={() => performAction("approve")}
                    disabled={actionBusy}
                  >
                    <Check size={16} />
                    {user.role === "manager"
                      ? "Approve to accounts"
                      : "Approve request"}
                  </button>
                  {!rejectOpen ? (
                    <button
                      className="button button-danger-outline button-full"
                      onClick={() => setRejectOpen(true)}
                    >
                      <X size={16} /> Reject with reason
                    </button>
                  ) : (
                    <div className="reject-form">
                      <label htmlFor="reject-reason">
                        Reason for rejection
                      </label>
                      <textarea
                        id="reject-reason"
                        className="form-input"
                        rows="3"
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Explain what needs to change"
                      />
                      <div className="reject-actions">
                        <button
                          className="button button-quiet"
                          onClick={() => setRejectOpen(false)}
                        >
                          Keep request
                        </button>
                        <button
                          className="button button-danger"
                          disabled={reason.trim().length < 10 || actionBusy}
                          onClick={() => performAction("reject", { reason })}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            {!canEdit && !canCancel && !canReview && (
              <div className="action-readonly">
                <ShieldCheck size={16} /> No action is available for your role
                and this status.
              </div>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}

function historyTitle(entry) {
  return (
    {
      created: "Request submitted",
      seeded: "Request recorded",
      updated: "Request updated",
      approve: "Request approved",
      reject: "Request rejected",
      cancelled: "Request cancelled",
    }[entry.action] || "Request activity"
  );
}

function ApprovalsPage() {
  const { token, user } = useOutletContext();
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [reason, setReason] = useState("");
  const [actionError, setActionError] = useState("");

  async function loadQueue() {
    const [queue, projectList] = await Promise.all([
      api("/approvals", { token }),
      api("/projects", { token }),
    ]);
    setItems(queue);
    setProjects(projectList);
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([api("/approvals", { token }), api("/projects", { token })])
      .then(([queue, projectList]) => {
        if (active) {
          setItems(queue);
          setProjects(projectList);
        }
      })
      .catch((cause) => {
        if (active) setError(cause.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function decide(item, action, payload = {}) {
    setBusyId(item.id);
    setActionError("");
    try {
      await api(`/requests/${item.id}/${action}`, {
        token,
        method: "POST",
        body: payload,
      });
      setRejectId(null);
      setReason("");
      await loadQueue();
    } catch (cause) {
      setActionError(cause.message);
    } finally {
      setBusyId(null);
    }
  }

  const stage = user.role === "manager" ? "Manager review" : "Accounts review";
  return (
    <>
      <PageHeading
        eyebrow={`APPROVALS / ${user.role.toUpperCase()}`}
        title="Approval queue"
        description={`${stage} · Oldest requests are shown first.`}
      />
      <div className="queue-summary">
        <span className="queue-summary-icon">
          <ShieldCheck size={19} />
        </span>
        <div>
          <strong>
            {items.length
              ? `${items.length} request${items.length === 1 ? "" : "s"} need your review`
              : "You're all caught up"}
          </strong>
          <span>
            {items.length
              ? "Review the project balance before deciding."
              : "New requests will appear here when they reach your stage."}
          </span>
        </div>
        <div className="queue-role">
          {roleLabel(user.role)}
          <span>REVIEWER</span>
        </div>
      </div>
      {actionError && <Alert>{actionError}</Alert>}
      {loading ? (
        <div className="loading-block">
          <span className="spinner" />
          Loading approval queue
        </div>
      ) : error ? (
        <Alert>{error}</Alert>
      ) : items.length ? (
        <div className="approval-list">
          {items.map((item, index) => {
            const project = projects.find(
              (entry) => Number(entry.id) === Number(item.projectId),
            );
            const remaining =
              item.remainingAfterApproval ?? project?.remaining ?? "0.00";
            const companyFundedAfter = item.companyFundedIfApproved ?? "0.00";
            return (
              <article className="surface approval-card" key={item.id}>
                <div className="approval-card-top">
                  <span className="queue-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="approval-wait">
                    <Clock3 size={13} /> WAITING SINCE{" "}
                    {shortDate(item.createdAt).toUpperCase()}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
                <div className="approval-card-main">
                  <div className="approval-description">
                    <span className="eyebrow">{item.projectName}</span>
                    <h2>
                      {item.category} <span>·</span> {money(item.amount)}
                    </h2>
                    <p>{item.description}</p>
                    <span className="approval-requester">
                      <span className="mini-avatar">
                        {initials(item.raisedBy)}
                      </span>
                      Raised by <strong>{item.raisedBy}</strong>
                    </span>
                  </div>
                  <div className="approval-metrics">
                    <div>
                      <span>REMAINING AFTER APPROVAL</span>
                      <strong
                        className={
                          (toPaise(remaining) ?? 0n) < 0n ? "text-danger" : ""
                        }
                      >
                        {money(remaining)}
                      </strong>
                      <small>{project?.name || "Project"}</small>
                    </div>
                    <div>
                      <span>COMPANY-FUNDED IF APPROVED</span>
                      <strong>{money(companyFundedAfter)}</strong>
                      <small>Projected total for this project</small>
                    </div>
                  </div>
                </div>
                <div className="approval-card-foot">
                  <Link className="text-link" to={`/requests/${item.id}`}>
                    View request history <ArrowUpRight size={15} />
                  </Link>
                  <div className="approval-actions">
                    <button
                      className="button button-danger-outline"
                      onClick={() => {
                        setRejectId(rejectId === item.id ? null : item.id);
                        setReason("");
                      }}
                      disabled={busyId === item.id}
                    >
                      <X size={15} /> Reject
                    </button>
                    <button
                      className="button button-primary"
                      onClick={() => decide(item, "approve")}
                      disabled={busyId === item.id}
                    >
                      {busyId === item.id ? (
                        "Saving…"
                      ) : (
                        <>
                          <Check size={15} /> Approve
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {rejectId === item.id && (
                  <div className="queue-reject">
                    <label htmlFor={`reason-${item.id}`}>
                      Reason for rejection
                    </label>
                    <div>
                      <input
                        id={`reason-${item.id}`}
                        className="form-input"
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Tell the requester what needs attention"
                      />
                      <button
                        className="button button-danger"
                        disabled={
                          reason.trim().length < 10 || busyId === item.id
                        }
                        onClick={() => decide(item, "reject", { reason })}
                      >
                        Confirm rejection
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="surface empty-state queue-empty">
          <span className="empty-icon empty-success">
            <CheckCircle2 size={25} />
          </span>
          <h3>No requests waiting</h3>
          <p>The queue is clear for now.</p>
        </div>
      )}
    </>
  );
}

function ProjectSummaryPage() {
  const { token, user } = useOutletContext();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api("/projects", { token })
      .then((rows) => {
        if (active) setProjects(rows);
      })
      .catch((cause) => {
        if (active) setError(cause.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const totals = useMemo(
    () =>
      projects.reduce(
        (sum, project) => ({
          budget: addMoney(sum.budget, project.budget),
          committed: addMoney(sum.committed, project.committed),
          approved: addMoney(sum.approved, project.approved),
          remaining: addMoney(sum.remaining, project.remaining),
          fundsReceived: addMoney(sum.fundsReceived, project.fundsReceived),
          companyFunded: addMoney(sum.companyFunded, project.companyFunded),
        }),
        {
          budget: "0.00",
          committed: "0.00",
          approved: "0.00",
          remaining: "0.00",
          fundsReceived: "0.00",
          companyFunded: "0.00",
        },
      ),
    [projects],
  );

  if (!["manager", "accounts"].includes(user.role))
    return <Navigate to="/requests" replace />;

  return (
    <>
      <PageHeading
        eyebrow="PROJECTS / PORTFOLIO"
        title="Project summary"
        description="A live view of project budgets, commitments, and funding."
        action={
          <span className="updated-chip">
            <span className="connection-dot" /> LIVE TOTALS
          </span>
        }
      />
      {error && <Alert>{error}</Alert>}
      <div className="metric-grid">
        <MetricCard
          icon={<Wallet size={17} />}
          label="Portfolio budget"
          value={money(totals.budget)}
          tone="green"
          detail={`${projects.length} active projects`}
        />
        <MetricCard
          icon={<FileClock size={17} />}
          label="Committed"
          value={money(totals.committed)}
          tone="lime"
          detail={`${Number(totals.budget) ? Math.round((Number(totals.committed) / Number(totals.budget)) * 100) : 0}% of total budget`}
        />
        <MetricCard
          icon={<CheckCircle2 size={17} />}
          label="Approved"
          value={money(totals.approved)}
          tone="blue"
          detail="Approved requests"
        />
        <MetricCard
          icon={<Banknote size={17} />}
          label="Funds received"
          value={money(totals.fundsReceived)}
          tone="coral"
          detail="Across all projects"
        />
      </div>
      <section className="surface project-surface">
        <div className="surface-toolbar project-toolbar">
          <div className="section-title">
            <div>
              <span className="eyebrow">PORTFOLIO DETAIL</span>
              <h2>Project allocation</h2>
            </div>
          </div>
          <span className="project-count">
            <FolderKanban size={15} /> {projects.length} PROJECTS
          </span>
        </div>
        {loading ? (
          <div className="loading-block">
            <span className="spinner" />
            Loading projects
          </div>
        ) : projects.length ? (
          <div className="project-list">
            {projects.map((project, index) => {
              const budgetPaise = toPaise(project.budget) ?? 0n;
              const committedPaise = toPaise(project.committed) ?? 0n;
              const committedPercent =
                budgetPaise > 0n
                  ? Number((committedPaise * 10000n) / budgetPaise) / 100
                  : 0;
              const percent = Math.min(Math.max(committedPercent, 0), 100);
              const isOver = (toPaise(project.remaining) ?? 0n) < 0n;
              return (
                <article className="project-row" key={project.id}>
                  <div className="project-name-cell">
                    <span
                      className={`project-index project-index-${index % 3}`}
                    >
                      0{index + 1}
                    </span>
                    <div>
                      <strong>{project.name}</strong>
                      <small>
                        Project {String(project.id).padStart(2, "0")}
                      </small>
                    </div>
                  </div>
                  <div className="project-budget-cell">
                    <div className="project-budget-label">
                      <span>COMMITTED / BUDGET</span>
                      <strong className={isOver ? "text-danger" : ""}>
                        {money(project.committed)}{" "}
                        <small>/ {money(project.budget)}</small>
                      </strong>
                    </div>
                    <div
                      className={`budget-track ${isOver ? "budget-track-over" : ""}`}
                      role="progressbar"
                      aria-label={`${project.name} committed budget`}
                      aria-valuenow={Math.round(percent)}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      <span style={{ width: `${percent}%` }} />
                    </div>
                    <span className="budget-percent">
                      {isOver
                        ? `${Math.round(committedPercent)}% · over budget`
                        : `${Math.round(percent)}% committed`}
                    </span>
                  </div>
                  <div className="project-stat">
                    <span>APPROVED</span>
                    <strong>{money(project.approved)}</strong>
                  </div>
                  <div className="project-stat">
                    <span>REMAINING</span>
                    <strong className={isOver ? "text-danger" : ""}>
                      {money(project.remaining)}
                    </strong>
                  </div>
                  <div className="project-stat">
                    <span>FUNDS RECEIVED</span>
                    <strong>{money(project.fundsReceived)}</strong>
                  </div>
                  <div className="project-stat">
                    <span>COMPANY-FUNDED</span>
                    <strong>{money(project.companyFunded)}</strong>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">
              <FolderKanban size={24} />
            </span>
            <h3>No projects found</h3>
            <p>Project balances will appear here when data is available.</p>
          </div>
        )}
      </section>
      <div className="summary-foot">
        <span>
          <SlidersHorizontal size={15} /> Remaining is budget less active
          commitments.
        </span>
        <span>LAST VIEWED {shortDate(new Date())}</span>
      </div>
    </>
  );
}

function MetricCard({ icon, label, value, tone, detail }) {
  return (
    <article className={`surface metric-card metric-${tone}`}>
      <div className="metric-top">
        <span>{label}</span>
        <span className="metric-icon">{icon}</span>
      </div>
      <strong className="metric-value">{value}</strong>
      <span className="metric-detail">{detail}</span>
    </article>
  );
}

export default function Root() {
  return <App />;
}
