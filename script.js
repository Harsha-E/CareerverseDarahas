// --- State ---
const studentProfile = {
  name: '',
  interests: [],
  skills: [],
  education: ''
};

let recommendations = [];

// --- Constants (same as your React arrays) ---
const interests = [
  'Technology',
  'Healthcare',
  'Business',
  'Arts',
  'Education',
  'Engineering',
  'Finance',
  'Marketing',
  'Design',
  'Science'
];

const skills = [
  'Programming',
  'Communication',
  'Leadership',
  'Problem Solving',
  'Creativity',
  'Data Analysis',
  'Project Management',
  'Public Speaking'
];

const educationLevels = ['High School', 'Undergraduate', 'Graduate', 'Professional'];

// Base career paths (can be extended)
const baseCareerPaths = [
  {
    title: 'AI / Machine Learning Engineer',
    coreInterests: ['Technology', 'Engineering', 'Science'],
    coreSkills: ['Programming', 'Problem Solving', 'Data Analysis'],
    description: 'Build intelligent systems and algorithms used in real-world products.',
    courses: ['Deep Learning Specialization', 'Python for Data Science', 'Neural Networks'],
    certifications: ['AWS ML Specialty', 'Google TensorFlow'],
    timeline: '6–12 months',
    demand: 'Very High'
  },
  {
    title: 'UX / UI Designer',
    coreInterests: ['Design', 'Arts', 'Technology', 'Marketing'],
    coreSkills: ['Creativity', 'Communication', 'Problem Solving'],
    description: 'Design user-centered digital products and delightful user experiences.',
    courses: ['Design Thinking', 'Figma Mastery', 'User Research'],
    certifications: ['Google UX Design', 'Adobe Certified'],
    timeline: '4–8 months',
    demand: 'High'
  },
  {
    title: 'Data Scientist',
    coreInterests: ['Science', 'Business', 'Technology'],
    coreSkills: ['Data Analysis', 'Programming', 'Problem Solving'],
    description: 'Extract insights from complex data sets to guide decisions.',
    courses: ['Statistics Fundamentals', 'SQL Mastery', 'R Programming'],
    certifications: ['Microsoft Data Analyst', 'IBM Data Science'],
    timeline: '8–14 months',
    demand: 'Very High'
  }
];

// --- View switching ---
function showView(viewId) {
  document.querySelectorAll('.view').forEach((view) => {
    view.classList.remove('active-view');
  });
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active-view');
}

// --- Chip rendering helpers ---
function createChip(label, groupType) {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'chip';
  chip.textContent = label;
  chip.dataset.value = label;
  chip.dataset.group = groupType;
  return chip;
}

function renderChips() {
  const interestsContainer = document.getElementById('interests-container');
  const skillsContainer = document.getElementById('skills-container');
  const educationContainer = document.getElementById('education-container');

  interests.forEach((interest) => {
    const chip = createChip(interest, 'interest');
    interestsContainer.appendChild(chip);
  });

  skills.forEach((skill) => {
    const chip = createChip(skill, 'skill');
    skillsContainer.appendChild(chip);
  });

  educationLevels.forEach((level) => {
    const chip = createChip(level, 'education');
    educationContainer.appendChild(chip);
  });
}

// --- Chip selection logic ---
function setupChipInteractions() {
  document.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;

    const value = chip.dataset.value;
    const group = chip.dataset.group;

    if (group === 'interest') {
      // multi-select
      toggleArraySelection(studentProfile.interests, value, (updated) => {
        studentProfile.interests = updated;
      });
      chip.classList.toggle('selected');
    } else if (group === 'skill') {
      // multi-select
      toggleArraySelection(studentProfile.skills, value, (updated) => {
        studentProfile.skills = updated;
      });
      chip.classList.toggle('selected');
    } else if (group === 'education') {
      // single-select
      studentProfile.education = value;
      // remove selection from siblings in same group
      document
        .querySelectorAll('.chip[data-group="education"]')
        .forEach((c) => c.classList.remove('selected'));
      chip.classList.add('selected');
    }
  });
}

function toggleArraySelection(array, item, setter) {
  const exists = array.includes(item);
  if (exists) {
    setter(array.filter((i) => i !== item));
  } else {
    setter([...array, item]);
  }
}

// --- Recommendations logic ---
function generateRecommendations() {
  const nameInput = document.getElementById('student-name');
  studentProfile.name = nameInput.value.trim();

  // Compute a "match score" based on overlaps
  recommendations = baseCareerPaths.map((career) => {
    const interestOverlap = intersectCount(
      studentProfile.interests,
      career.coreInterests
    );
    const skillOverlap = intersectCount(
      studentProfile.skills,
      career.coreSkills
    );

    let baseScore = 60;
    baseScore += interestOverlap * 10;
    baseScore += skillOverlap * 8;

    // tiny bonus for higher education
    if (studentProfile.education === 'Undergraduate') baseScore += 4;
    if (studentProfile.education === 'Graduate') baseScore += 6;
    if (studentProfile.education === 'Professional') baseScore += 8;

    const match = Math.max(50, Math.min(98, baseScore)); // clamp 50–98

    return { ...career, match: Math.round(match) };
  });

  renderResults();
  showView('results-view');
}

function intersectCount(a, b) {
  return a.filter((x) => b.includes(x)).length;
}

// --- Render results cards ---
function renderResults() {
  const container = document.getElementById('results-container');
  container.innerHTML = '';

  if (!recommendations.length) {
    container.innerHTML = '<p>No recommendations yet. Try filling the form again.</p>';
    return;
  }

  const name = studentProfile.name || 'You';

  recommendations
    .sort((a, b) => b.match - a.match)
    .forEach((career) => {
      const card = document.createElement('article');
      card.className = 'result-card';

      card.innerHTML = `
        <div class="result-header">
          <div>
            <div class="result-title">${career.title}</div>
            <p class="result-desc">
              ${name} could grow into this role by following a structured learning path and building
              practical projects along the way.
            </p>
          </div>
          <div class="result-match">
            <div class="result-match-value">${career.match}%</div>
            <div class="result-match-label">Match</div>
          </div>
        </div>

        <div class="result-body">
          <div>
            <div class="result-subtitle">📚 Recommended Courses</div>
            <ul class="result-list">
              ${career.courses
                .map(
                  (course) => `
                <li>
                  <span class="bullet"></span>
                  <span>${course}</span>
                </li>`
                )
                .join('')}
            </ul>
          </div>
          <div>
            <div class="result-subtitle">🏅 Certifications</div>
            <ul class="result-list">
              ${career.certifications
                .map(
                  (cert) => `
                <li>
                  <span class="bullet"></span>
                  <span>${cert}</span>
                </li>`
                )
                .join('')}
            </ul>
          </div>
        </div>

        <div class="result-meta">
          <div>
            <strong>Timeline</strong>
            <span>${career.timeline}</span>
          </div>
          <div>
            <strong>Market Demand</strong>
            <span>${career.demand}</span>
          </div>
        </div>

        <button class="trajectory-btn">
          View full learning roadmap →
        </button>
      `;

      container.appendChild(card);
    });
}

// --- Event bindings ---
function setupEvents() {
  document
    .getElementById('start-questionnaire')
    .addEventListener('click', () => {
      showView('questionnaire-view');
    });

  document.getElementById('back-to-welcome').addEventListener('click', () => {
    showView('welcome-view');
  });

  document.getElementById('generate-btn').addEventListener('click', () => {
    generateRecommendations();
  });

  document.getElementById('restart-btn').addEventListener('click', () => {
    showView('welcome-view');
  });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  renderChips();
  setupChipInteractions();
  setupEvents();
});
