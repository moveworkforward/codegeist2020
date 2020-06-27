import ForgeUI, {
  render,
  Fragment,
  Macro,
  Text,
  Button,
  ConfigForm,
  TextField,
  Image,
  UserPicker,
  Select,
  Option,
  useConfig,
  useAction,
  useState,
  useProductContext
} from "@forge/ui";
import api from "@forge/api";

// Get number of issues assigned to user
const getAssignedIssues = async (userID) => {
  const response = await api.asApp().requestJira('/rest/api/3/search', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      "Content-Type": "application/json"
    },
    body: `{
      "jql": "assignee = ${userID}",
      "fields": [
        "summary"
      ]
    }`
  });

  if (!response.ok) {
      const err = `Error while getDisplayName`;
      console.error(err);
      throw new Error(err);
  }

  return await response.json();
};

// Get number of issues reported by user
const getReportedIssues = async (userID) => {
  const response = await api.asApp().requestJira('/rest/api/3/search', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      "Content-Type": "application/json"
    },
    body: `{
      "jql": "reporter = ${userID}",
      "fields": [
        "comment"
      ]
    }`
  });

  if (!response.ok) {
      const err = `Error while getDisplayName`;
      console.error(err);
      throw new Error(err);
  }

  return await response.json();
};

// Get user's display name from Jira API
const getDisplayName = async (userID) => {
  const response = await api.asApp().requestJira(`/rest/api/3/user?accountId=${userID}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
      const err = `Error while getDisplayName`;
      console.error(err);
      throw new Error(err);
  }

  return await response.json();
};

const App = () => {
  // Retrieve the configuration
  const config = useConfig();

  // Get first user's info
  const [userName1] = useAction(
    () => null, async () => await getDisplayName(config.user1)
  );
  const [userAssignedIssues1] = useAction(
    () => null, async () => await getAssignedIssues(config.user1)
  );
  const [userReportedIssues1] = useAction(
    () => null, async () => await getReportedIssues(config.user1)
  );
  // console.log(userReportedIssues1.issues[0].fields.comment.comments[0].author.displayName);
  const userNameText1 = `User 1: ${userName1.displayName}`;
  const userAssignedIssuesText1 = `Number of assigned issues: ${userAssignedIssues1.issues.length}`;
  const userReportedIssuesText1 = `Number of reported issues: ${userReportedIssues1.issues.length}`;

  // Get second user's info
  const [userName2] = useAction(
    () => null, async () => await getDisplayName(config.user2)
  );
  const [userAssignedIssues2] = useAction(
    () => null, async () => await getAssignedIssues(config.user2)
  );
  const [userReportedIssues2] = useAction(
    () => null, async () => await getReportedIssues(config.user2)
  );
  const userNameText2 = `User 2: ${userName2.displayName}`;
  const userAssignedIssuesText2 = `Number of assigned issues: ${userAssignedIssues2.issues.length}`;
  const userReportedIssuesText2 = `Number of reported issues: ${userReportedIssues2.issues.length}`;

  /* ------------------------- DRAW RADAR CHART ------------------------- */
  const radius = 250;

  // Draw the circles making up the base of the radar chart
  const circle =
    `<circle
        cx="${radius}"
        cy="${radius}"
        r="${radius}"
        fill="#FAFAFA"
        stroke="#999"
        stroke-width=".2"
    />
    <circle
        cx="${radius}"
        cy="${radius}"
        r="${.75*radius}"
        fill="#FAFAFA"
        stroke="#999"
        stroke-width=".2"
    />
    <circle
        cx="${radius}"
        cy="${radius}"
        r="${.5*radius}"
        fill="#FAFAFA"
        stroke="#999"
        stroke-width=".2"
    />
    <circle
        cx="${radius}"
        cy="${radius}"
        r="${.25*radius}"
        fill="#FAFAFA"
        stroke="#999"
        stroke-width=".2"
    />`;

  // Lines radiating out from center
  // Angles: 18, 90, 162, 234, 306
  const line =
    `<line
      x1="${radius}"
      y1="${radius}"
      x2="488"
      y2="327"
      style="stroke:#999;stroke-width:0.3"
    />
    <line
      x1="${radius}"
      y1="${radius}"
      x2="250"
      y2="500"
      style="stroke:#999;stroke-width:0.3"
    />
    <line
      x1="${radius}"
      y1="${radius}"
      x2="12"
      y2="327"
      style="stroke:#999;stroke-width:0.3"
    />
    <line
      x1="${radius}"
      y1="${radius}"
      x2="103"
      y2="48"
      style="stroke:#999;stroke-width:0.3"
    />
    <line
      x1="${radius}"
      y1="${radius}"
      x2="397"
      y2="48"
      style="stroke:#999;stroke-width:0.3"
    />`;

  // Transform polar coordinate to cartesian
  // Use to transform skill rating [0-1] to point on radar chart
  // p: the skill rating, [0-1]
  // theta: the angle in degrees, [18, 90, 162, 234, 306]
  const polarCartesian = (p, theta) => {
    const rad = theta * (Math.PI/180);
    const x = radius * p * Math.cos(rad) + radius;
    const y = radius * p * Math.sin(rad) + radius;
    return {x:x, y:y};
  };

  // convert skill ratings to chart points
  const communication = polarCartesian(config.communication, 18);
  const technical = polarCartesian(config.technical, 90);
  const leadership = polarCartesian(config.leadership, 162);
  const teamwork = polarCartesian(config.teamwork, 234);
  const deadlines = polarCartesian(config.deadlines, 306);

  // Polygon showing users skills for each dimension
  // Angles: 18, 90, 162, 234, 306
  const poly =
    `<polygon
      points="${communication.x},${communication.y} ${technical.x},${technical.y} ${leadership.x},${leadership.y} ${teamwork.x},${teamwork.y} ${deadlines.x},${deadlines.y}"
      style="fill:#5D1D1D;stroke:#5D1D1D;stroke-width:1;opacity:0.3;"
    />`;

  // Second user's polygon
  const communication2 = polarCartesian(config.communication2, 18);
  const technical2 = polarCartesian(config.technical2, 90);
  const leadership2 = polarCartesian(config.leadership2, 162);
  const teamwork2 = polarCartesian(config.teamwork2, 234);
  const deadlines2 = polarCartesian(config.deadlines2, 306);

  const poly2 =
    `<polygon
      points="${communication2.x},${communication2.y} ${technical2.x},${technical2.y} ${leadership2.x},${leadership2.y} ${teamwork2.x},${teamwork2.y} ${deadlines2.x},${deadlines2.y}"
      style="fill:#28305C;stroke:#28305C;stroke-width:1;opacity:0.3;"
    />`;

  // Labels for each dimension
  const caption =
    `<text x="495" y="327" fill="#777" >Communication</text>
    <text x="190" y="520" fill="#777" >Technical Knowledge</text>
    <text x="0" y="327" fill="#777" >Leadership</text>
    <text x="70" y="40" fill="#777" >Teamwork</text>
    <text x="399" y="45" fill="#777" >Meeting Deadlines</text>`;

  // Combine all elements for the final svg
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 ${radius*2+100} ${radius*2+100}"
                  width="${radius*2}"
                  height="${radius*2}"
                >` + `<g>` + circle + line + poly + poly2 + caption + `</g>` + `</svg>`

  // Use the configuration values
  return (
    <Fragment>
      <Text content={userNameText1} />
      <Text content={userAssignedIssuesText1} />
      <Text content={userReportedIssuesText1} />
      <Text content={userNameText2} />
      <Text content={userAssignedIssuesText2} />
      <Text content={userReportedIssuesText2} />
      <Image
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
        alt='Summary banner'
      />
    </Fragment>
  );
};

// Function that defines the configuration UI
// This is the modal that pops up when you edit the macro
const Config = () => {
  return (
    <ConfigForm>
      <UserPicker label="User" name="user1" />
      <Select label="Communication" name="communication">
        <Option defaultSelected label="1" value="0.1" />
        <Option label="2" value="0.2" />
        <Option label="3" value="0.3" />
        <Option label="4" value="0.4" />
        <Option label="5" value="0.5" />
        <Option label="6" value="0.6" />
        <Option label="7" value="0.7" />
        <Option label="8" value="0.8" />
        <Option label="9" value="0.9" />
        <Option label="10" value="1" />
      </Select>
      <Select label="Technical Knowledge" name="technical">
        <Option defaultSelected label="1" value="0.1" />
        <Option label="2" value="0.2" />
        <Option label="3" value="0.3" />
        <Option label="4" value="0.4" />
        <Option label="5" value="0.5" />
        <Option label="6" value="0.6" />
        <Option label="7" value="0.7" />
        <Option label="8" value="0.8" />
        <Option label="9" value="0.9" />
        <Option label="10" value="1" />
      </Select>
      <Select label="Leadership" name="leadership">
        <Option defaultSelected label="1" value="0.1" />
        <Option label="2" value="0.2" />
        <Option label="3" value="0.3" />
        <Option label="4" value="0.4" />
        <Option label="5" value="0.5" />
        <Option label="6" value="0.6" />
        <Option label="7" value="0.7" />
        <Option label="8" value="0.8" />
        <Option label="9" value="0.9" />
        <Option label="10" value="1" />
      </Select>
      <Select label="Teamwork" name="teamwork">
        <Option defaultSelected label="1" value="0.1" />
        <Option label="2" value="0.2" />
        <Option label="3" value="0.3" />
        <Option label="4" value="0.4" />
        <Option label="5" value="0.5" />
        <Option label="6" value="0.6" />
        <Option label="7" value="0.7" />
        <Option label="8" value="0.8" />
        <Option label="9" value="0.9" />
        <Option label="10" value="1" />
      </Select>
      <Select label="Meeting Deadlines" name="deadlines">
        <Option defaultSelected label="1" value="0.1" />
        <Option label="2" value="0.2" />
        <Option label="3" value="0.3" />
        <Option label="4" value="0.4" />
        <Option label="5" value="0.5" />
        <Option label="6" value="0.6" />
        <Option label="7" value="0.7" />
        <Option label="8" value="0.8" />
        <Option label="9" value="0.9" />
        <Option label="10" value="1" />
      </Select>

      <UserPicker label="User" name="user2" />
      <Select label="Communication" name="communication2">
        <Option defaultSelected label="1" value="0.1" />
        <Option label="2" value="0.2" />
        <Option label="3" value="0.3" />
        <Option label="4" value="0.4" />
        <Option label="5" value="0.5" />
        <Option label="6" value="0.6" />
        <Option label="7" value="0.7" />
        <Option label="8" value="0.8" />
        <Option label="9" value="0.9" />
        <Option label="10" value="1" />
      </Select>
      <Select label="Technical Knowledge" name="technical2">
        <Option defaultSelected label="1" value="0.1" />
        <Option label="2" value="0.2" />
        <Option label="3" value="0.3" />
        <Option label="4" value="0.4" />
        <Option label="5" value="0.5" />
        <Option label="6" value="0.6" />
        <Option label="7" value="0.7" />
        <Option label="8" value="0.8" />
        <Option label="9" value="0.9" />
        <Option label="10" value="1" />
      </Select>
      <Select label="Leadership" name="leadership2">
        <Option defaultSelected label="1" value="0.1" />
        <Option label="2" value="0.2" />
        <Option label="3" value="0.3" />
        <Option label="4" value="0.4" />
        <Option label="5" value="0.5" />
        <Option label="6" value="0.6" />
        <Option label="7" value="0.7" />
        <Option label="8" value="0.8" />
        <Option label="9" value="0.9" />
        <Option label="10" value="1" />
      </Select>
      <Select label="Teamwork" name="teamwork2">
        <Option defaultSelected label="1" value="0.1" />
        <Option label="2" value="0.2" />
        <Option label="3" value="0.3" />
        <Option label="4" value="0.4" />
        <Option label="5" value="0.5" />
        <Option label="6" value="0.6" />
        <Option label="7" value="0.7" />
        <Option label="8" value="0.8" />
        <Option label="9" value="0.9" />
        <Option label="10" value="1" />
      </Select>
      <Select label="Meeting Deadlines" name="deadlines2">
        <Option defaultSelected label="1" value="0.1" />
        <Option label="2" value="0.2" />
        <Option label="3" value="0.3" />
        <Option label="4" value="0.4" />
        <Option label="5" value="0.5" />
        <Option label="6" value="0.6" />
        <Option label="7" value="0.7" />
        <Option label="8" value="0.8" />
        <Option label="9" value="0.9" />
        <Option label="10" value="1" />
      </Select>
    </ConfigForm>
  );
};

// A macro containing props for the app code, configuration,
// and default configuration values.
export const run = render(
  <Macro
    app={<App />}
    config={<Config />}
    defaultConfig={{
      communication: "0.1",
      technical: "0.1",
      leadership: "0.1",
      teamwork: "0.1",
      deadlines: "0.1",
      communication2: "0.1",
      technical2: "0.1",
      leadership2: "0.1",
      teamwork2: "0.1",
      deadlines2: "0.1"
    }}
  />
);
