let progress = 0;
let loadingInterval;
const loadingScreen = $('#loadingScreen');
const loadingLeft = $('#loadingLeft');
const loadingRight = $('#loadingRight');
const loadingContent = $('#loadingContent');
const mainContent = $('#main');
const footerDate = document.getElementById('date');
const currentPath = window.location.pathname;
const currentHref = window.location.href;
const navLinks = document.querySelectorAll('.nav a');

// Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navbar = document.getElementById('navbar');

if (hamburger && navbar) {
  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('active');
    navbar.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });

  // Handle mobile dropdown toggles
  const dropdownParents = document.querySelectorAll('.nav > ul > li');
  dropdownParents.forEach(parent => {
    const hasDropdown = parent.querySelector('ul');
    if (hasDropdown) {
      const parentLink = parent.querySelector('a');

      // Add dropdown indicator and toggle button
      if (!parentLink.querySelector('.dropdown-indicator')) {
        const indicator = document.createElement('span');
        indicator.className = 'dropdown-indicator';
        indicator.innerHTML = ' ▼';
        indicator.style.cssText = 'font-size: 0.8em; margin-left: 8px; transition: transform 0.3s ease; cursor: pointer;';
        parentLink.appendChild(indicator);

        // Add click handler to the indicator only
        indicator.addEventListener('click', function (e) {
          if (window.innerWidth <= 1212) {
            e.preventDefault();
            e.stopPropagation();
            parent.classList.toggle('dropdown-open');

            // Rotate indicator
            indicator.style.transform = parent.classList.contains('dropdown-open') ? 'rotate(180deg)' : 'rotate(0deg)';
          }
        });
      }

      // Allow parent link to navigate normally on mobile
      parentLink.addEventListener('click', function (e) {
        if (window.innerWidth <= 1212) {
          // Check if click was on the dropdown indicator
          if (e.target.classList.contains('dropdown-indicator')) {
            return; // Let the indicator handle it
          }
          // Allow normal navigation for the parent link
          // Don't prevent default - let the link work normally
        }
      });
    }
  });

  // Close mobile menu when clicking on a dropdown link (not parent)
  const dropdownLinks = document.querySelectorAll('.nav ul ul li a');
  dropdownLinks.forEach(link => {
    link.addEventListener('click', function () {
      hamburger.classList.remove('active');
      navbar.classList.remove('active');
      document.body.classList.remove('menu-open');
      // Remove all dropdown-open classes
      dropdownParents.forEach(parent => {
        parent.classList.remove('dropdown-open');
      });
    });
  });

  // Close mobile menu when clicking on main nav links (without dropdowns)
  const mainNavLinks = document.querySelectorAll('.nav > ul > li > a');
  mainNavLinks.forEach(link => {
    const parent = link.parentElement;
    const hasDropdown = parent.querySelector('ul');
    if (!hasDropdown) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('active');
        navbar.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    }
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', function (event) {
    const isClickInsideNav = navbar.contains(event.target);
    const isClickOnHamburger = hamburger.contains(event.target);

    if (!isClickInsideNav && !isClickOnHamburger && navbar.classList.contains('active')) {
      hamburger.classList.remove('active');
      navbar.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  });

  // Handle window resize
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1212) {
      hamburger.classList.remove('active');
      navbar.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  });

  // Handle escape key to close menu
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && navbar.classList.contains('active')) {
      hamburger.classList.remove('active');
      navbar.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  });
}
// ||(linkHref.endsWith(currentPath.replace('/', '')))
navLinks.forEach(link => {
  const linkHref = link.getAttribute('href');
  if (linkHref) {
    // Handle different path formats
    if (linkHref === currentPath ||
      linkHref === currentHref ||
      (currentPath === '/' && linkHref === './index.html') ||
      (currentPath === '/index.html' && linkHref === './index.html') ||
      (currentPath.endsWith(linkHref.replace('./', '/')))) {
      link.classList.add('active');
    }
  }
});

if (footerDate) {
  footerDate.textContent = new Date().getFullYear();
}
// Show loading screen immediately when page starts loading
$(document).ready(function () {
  // Start loading animation function
  function startLoading() {
    if (loadingInterval) clearInterval(loadingInterval);

    // Reset states - show loading screen
    progress = 0;
    loadingScreen.css('display', 'flex');
    loadingLeft.css('transform', 'translateX(0)');
    loadingRight.css('transform', 'translateX(0)');
    loadingContent.css('opacity', '1');
    mainContent.css('opacity', '0');

    // Start loading progress
    loadingInterval = setInterval(function () {
      progress += 2; // Faster progress to match actual loading

      // When loading completes
      if (progress >= 100) {
        clearInterval(loadingInterval);

        // Remove loading content first
        setTimeout(function () {
          loadingContent.css('opacity', '0');

          // After loading content is hidden, open the doors
          setTimeout(function () {
            loadingLeft.css('transform', 'translateX(-100%)');
            loadingRight.css('transform', 'translateX(100%)');

            // Show main content
            setTimeout(function () {
              mainContent.css('opacity', '1');

              // Remove loading screen after transition
              setTimeout(function () {
                loadingScreen.css('display', 'none');
              }, 100);
            }, 800);
          }, 100); // Wait for loading content to fade out
        }, 500);
      }
    }, 20); // Faster interval
  }

  // Always show loading animation when page loads
  startLoading();
});

// Also handle page load completion
$(window).on('load', function () {
  // Ensure loading completes when page is fully loaded
  if (progress < 100) {
    progress = 100;
  }
});

// Chat functionality
let chatOpen = false;

// Conversation flow state
let currentStep = 0;
let userData = {};
let waitingForResponse = false;
let currentQuestionIndex = 0;
let conversationStarted = false;

// Country-wise universities database
const universities = {
  "USA": [
    { name: "Southeast Missouri State University", location: "Missouri", programs: "Business, Education, Health", ranking: "Regional University" },
    { name: "San Diego State University", location: "California", programs: "Engineering, Business, Arts", ranking: "Top Public University" },
    { name: "Mercy University", location: "New York", programs: "Health Sciences, Business, Education", ranking: "Private University" }
  ],
  "Australia": [
    { name: "University of Southern Queensland", location: "Queensland", programs: "Engineering, IT, Business", ranking: "5 Stars for Student Support" },
    { name: "Churchill Institute of Higher Education", location: "Sydney", programs: "Business, IT, Hospitality", ranking: "Vocational Excellence" },
    { name: "Alphacrucis University College", location: "Multiple Cities", programs: "Theology, Business, Education", ranking: "Christian University" }
  ],
  "UK": [
    { name: "University of Plymouth", location: "Plymouth", programs: "Marine Science, Medicine, Engineering", ranking: "Modern University" },
    { name: "Middlesex University", location: "London", programs: "Arts, Business, Law", ranking: "Global Diversity" },
    { name: "Huddersfield University", location: "West Yorkshire", programs: "Engineering, Music, Education", ranking: "Teaching Excellence" }
  ],
  "Canada": [
    { name: "University Canada West", location: "Vancouver", programs: "Business, Arts, Communication", ranking: "Career-focused" },
    { name: "Ascenda College of Management", location: "Vancouver", programs: "Business Management, Hospitality", ranking: "Industry Connections" },
    { name: "University of Niagara Falls", location: "Ontario", programs: "Business, Digital Media, Cybersecurity", ranking: "Innovation Focus" }
  ]
};

// Steps in the process - tailored for study abroad consultancy
const steps = [
  {
    name: "Profile",
    questions: [
      "May I have your full name?",
      "What is your email address? (We'll send important information here)",
      "And your phone number with country code?"
    ],
    fields: ["name", "email", "phone"],
    validation: [null, validateEmail, validatePhone]
  },
  {
    name: "Preferences",
    questions: [
      "Which country are you interested in studying?",
      "What level of study are you pursuing? (Bachelor's, Master's, PhD, etc.)",
      "When do you plan to start your studies? (e.g., Fall 2024, Spring 2025)"
    ],
    fields: ["country", "studyLevel", "intake"],
    options: [
      null,
      ["Bachelor's", "Master's", "PhD", "Diploma/Certificate", "Other"],
      ["Fall 2024", "Spring 2025", "Fall 2025", "Spring 2026", "Not sure yet"]
    ]
  },
  {
    name: "Academic",
    questions: [
      "What is your current or highest education level completed?",
      "What field are you interested in studying? (e.g., Computer Science, Business, Engineering)",
      "Do you have any English proficiency test scores? (IELTS/TOEFL/PTE)"
    ],
    fields: ["currentEducation", "field", "englishScore"]
  },
  {
    name: "Universities",
    questions: [
      "Based on your interest in studying in {country}, here are some universities we work with. Would you like to know more about any of them?",
      "Great! Let me provide more details about {selectedUniversity}",
      "Would you like to explore more universities or proceed to connect with a consultant?"
    ],
    fields: ["universityInterest", "selectedUniversity", "proceedOption"]
  },
  {
    name: "Consultant",
    questions: [
      "Based on your information, I'll connect you with our study abroad specialist. Is there anything specific you'd like me to mention to them?"
    ],
    fields: ["additionalInfo"]
  }
];

// Popular study destinations
const countries = [
  "USA", "UK", "Canada", "Australia", "Germany", "France", "Netherlands", "Japan",
  "New Zealand", "Singapore", "Ireland", "Sweden", "Switzerland", "Other"
];

// Email validation function
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation function
function validatePhone(phone) {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

function toggleChat() {
  const chatWindow = document.getElementById('chatWindow');
  if (chatOpen) {
    closeChat();
  } else {
    openChat();
  }
}

function openChat() {
  const chatWindow = document.getElementById('chatWindow');
  const chatNotification = document.getElementById('chatNotification');

  chatWindow.classList.add('active');
  if (chatNotification) {
    chatNotification.style.display = 'none';
  }
  chatOpen = true;

  // Initialize chat if not already done
  initializeChat();
}

function closeChat() {
  const chatWindow = document.getElementById('chatWindow');
  chatWindow.classList.remove('active');
  chatOpen = false;
}

function openChatWithCountry(country) {
  openChat();
  setTimeout(() => {
    userData.country = country;
    currentStep = 3;
    currentQuestionIndex = 0;
    conversationStarted = true;
    showUniversityOptions();
  }, 500);
}

function scrollToServices() {
  document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
}

// Initialize chat functionality
function initializeChat() {
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');

  if (!chatMessages || !chatInput) return;

  // Show welcome message if chat is empty
  if (chatMessages.children.length === 0) {
    showWelcomeMessage();
  }

  // Auto-resize textarea
  chatInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });

  // Handle Enter key
  chatInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

function showWelcomeMessage() {
  const chatMessages = document.getElementById('chatMessages');

  addBotMessage("Hello! I'm your ROYAL Education Study Abroad Assistant. I'm here to help you explore study abroad opportunities and find the perfect university for your goals.");

  setTimeout(() => {
    addBotMessage("I can help you with:");

    const optionsDiv = document.createElement('div');
    optionsDiv.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;';
    optionsDiv.innerHTML = `
      <div class="chat-option" onclick="startProcess()">Start Study Abroad Assessment</div>
      <div class="chat-option" onclick="askQuestion('What universities do you recommend in the USA?')">USA University Options</div>
      <div class="chat-option" onclick="askQuestion('What are the admission requirements for Canada?')">Canada Requirements</div>
      <div class="chat-option" onclick="askQuestion('Tell me about scholarship opportunities')">Scholarship Information</div>
    `;

    chatMessages.lastElementChild.appendChild(optionsDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 1000);
}

// Start the step-by-step process
function startProcess() {
  conversationStarted = true;
  currentStep = 0;
  currentQuestionIndex = 0;
  askNextQuestion();
}

// Ask the next question in the current step
function askNextQuestion() {
  if (currentStep >= steps.length) {
    completeProcess();
    return;
  }

  const step = steps[currentStep];

  if (currentQuestionIndex < step.questions.length) {
    // Check if we need to show options for this question
    if (step.options && step.options[currentQuestionIndex]) {
      showQuestionWithOptions(step.questions[currentQuestionIndex], step.options[currentQuestionIndex]);
    } else if (currentStep === 1 && currentQuestionIndex === 0) {
      // Special case for country selection
      showCountryOptions(step.questions[currentQuestionIndex]);
    } else if (currentStep === 3 && currentQuestionIndex === 0) {
      // Special case for university selection
      showUniversityOptions();
    } else if (currentStep === 3 && currentQuestionIndex === 1) {
      // Show details for selected university
      showUniversityDetails();
    } else if (currentStep === 3 && currentQuestionIndex === 2) {
      // Ask if user wants to proceed
      showProceedOptions();
    } else {
      addBotMessage(step.questions[currentQuestionIndex]);
    }
    waitingForResponse = true;
  } else {
    currentStep++;
    currentQuestionIndex = 0;
    if (currentStep < steps.length) {
      setTimeout(() => askNextQuestion(), 1000);
    } else {
      completeProcess();
    }
  }
}

function closCard() {
  closeServiceModal();
  openChat();
}

// Show question with predefined options
function showQuestionWithOptions(question, options) {
  addBotMessage(question);

  const optionsDiv = document.createElement('div');
  optionsDiv.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;';

  options.forEach(option => {
    const optionBtn = document.createElement('div');
    optionBtn.className = 'chat-option';
    optionBtn.textContent = option;
    optionBtn.onclick = () => {
      document.getElementById('chatInput').value = option;
      sendMessage();
    };
    optionsDiv.appendChild(optionBtn);
  });

  const chatMessages = document.getElementById('chatMessages');
  chatMessages.lastElementChild.appendChild(optionsDiv);
}

// Show country options
function showCountryOptions(question) {
  addBotMessage(question || "Which country are you interested in studying?");

  const container = document.createElement('div');
  container.style.cssText = 'display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px;';

  countries.forEach(country => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'country-btn';
    btn.textContent = country;
    btn.style.cssText = `
      background-color: #ffffff;
      border: 1px solid #d9d9e3;
      color: #0d1b3e;
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    `;
    btn.onmouseover = () => {
      btn.style.backgroundColor = '#fe0001';
      btn.style.color = '#ffffff';
      btn.style.borderColor = '#fe0001';
    };
    btn.onmouseout = () => {
      btn.style.backgroundColor = '#ffffff';
      btn.style.color = '#0d1b3e';
      btn.style.borderColor = '#d9d9e3';
    };
    btn.onclick = () => {
      document.getElementById('chatInput').value = country;
      sendMessage();
    };
    container.appendChild(btn);
  });

  const chatMessages = document.getElementById('chatMessages');
  chatMessages.lastElementChild.appendChild(container);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show university options based on selected country
function showUniversityOptions() {
  const country = userData.country;
  let question = steps[3].questions[0].replace("{country}", country);
  addBotMessage(question);

  if (universities[country]) {
    const unis = universities[country];
    const uniList = document.createElement('div');
    uniList.style.cssText = 'margin-top: 12px;';

    unis.forEach(uni => {
      const uniOption = document.createElement('div');
      uniOption.className = 'university-option';
      uniOption.style.cssText = `
        background-color: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: all 0.2s;
      `;
      uniOption.innerHTML = `
        <h5 style="margin: 0 0 4px 0; color: #0d1b3e;">${uni.name}</h5>
        <p style="margin: 0; font-size: 12px; color: #6c757d;">Location: ${uni.location} | Programs: ${uni.programs}</p>
      `;
      uniOption.onmouseover = () => {
        uniOption.style.backgroundColor = '#e3f2fd';
        uniOption.style.borderColor = '#2196f3';
      };
      uniOption.onmouseout = () => {
        uniOption.style.backgroundColor = '#f8f9fa';
        uniOption.style.borderColor = '#e9ecef';
      };
      uniOption.onclick = () => {
        userData.selectedUniversity = uni.name;
        document.getElementById('chatInput').value = uni.name;
        sendMessage();
      };
      uniList.appendChild(uniOption);
    });

    const chatMessages = document.getElementById('chatMessages');
    chatMessages.lastElementChild.appendChild(uniList);
  } else {
    addBotMessage("We work with many universities in " + country + ". Our consultant will provide you with the best options based on your profile.");
    currentQuestionIndex = steps[3].questions.length - 1;
    setTimeout(() => askNextQuestion(), 1500);
  }
}

// Show details for selected university
function showUniversityDetails() {
  const country = userData.country;
  const uniName = userData.selectedUniversity;

  if (universities[country]) {
    const uni = universities[country].find(u => u.name === uniName);
    if (uni) {
      const uniCard = document.createElement('div');
      uniCard.style.cssText = `
        background-color: #f0f7f4;
        border-left: 3px solid #10a37f;
        padding: 12px;
        border-radius: 4px;
        margin: 12px 0;
      `;
      uniCard.innerHTML = `
        <h4 style="margin: 0 0 8px 0; color: #0d1b3e;">${uni.name}</h4>
        <p style="margin: 4px 0;"><strong>Location:</strong> ${uni.location}</p>
        <p style="margin: 4px 0;"><strong>Popular Programs:</strong> ${uni.programs}</p>
        <p style="margin: 4px 0;"><strong>Ranking/Recognition:</strong> ${uni.ranking}</p>
        <p style="margin: 4px 0;"><strong>Why Choose This University:</strong> ${getUniversityBenefits(uni.name)}</p>
      `;

      const chatMessages = document.getElementById('chatMessages');
      chatMessages.appendChild(uniCard);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  currentQuestionIndex++;
  setTimeout(() => askNextQuestion(), 1500);
}

// Show proceed options after university selection
function showProceedOptions() {
  addBotMessage(steps[3].questions[2]);

  const optionsDiv = document.createElement('div');
  optionsDiv.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;';
  optionsDiv.innerHTML = `
    <div class="chat-option" onclick="selectProceedOption('more')">Explore more universities</div>
    <div class="chat-option" onclick="selectProceedOption('proceed')">Proceed to consultant</div>
  `;

  const chatMessages = document.getElementById('chatMessages');
  chatMessages.lastElementChild.appendChild(optionsDiv);
}

// Handle proceed option selection
function selectProceedOption(option) {
  if (option === 'more') {
    document.getElementById('chatInput').value = "Explore more universities";
    currentQuestionIndex = 0;
  } else {
    document.getElementById('chatInput').value = "Proceed to consultant";
    currentQuestionIndex = steps[3].questions.length;
  }
  sendMessage();
}

// Get university benefits description
function getUniversityBenefits(uniName) {
  const benefits = {
    "Southeast Missouri State University": "Strong industry connections, affordable tuition, and comprehensive student support services.",
    "San Diego State University": "Located in a vibrant city, strong research programs, and excellent career opportunities in Southern California.",
    "Mercy University": "Personalized education, diverse student body, and strong focus on professional development.",
    "University of Southern Queensland": "Flexible study options, strong regional focus, and supportive learning environment.",
    "Churchill Institute of Higher Education": "Practical skills focus, industry-relevant curriculum, and strong employment outcomes.",
    "Alphacrucis University College": "Values-based education, small class sizes, and strong community atmosphere.",
    "University of Plymouth": "Marine science excellence, beautiful coastal location, and strong research reputation.",
    "Middlesex University": "London location, diverse international community, and strong industry links.",
    "Huddersfield University": "Teaching excellence, strong graduate employment, and affordable living costs.",
    "University Canada West": "Vancouver location, business-focused programs, and flexible study options.",
    "Ascenda College of Management": "Practical business education, industry connections, and career-focused approach.",
    "University of Niagara Falls": "Innovative programs, beautiful location, and growing reputation in digital fields."
  };

  return benefits[uniName] || "Strong academic programs, international student support, and excellent career opportunities.";
}

// Send message function
function sendMessage() {
  const chatInput = document.getElementById('chatInput');
  const message = chatInput.value.trim();
  if (message === '') return;

  conversationStarted = true;
  addUserMessage(message);
  chatInput.value = '';
  chatInput.style.height = 'auto';

  if (waitingForResponse) {
    // Validate input if there's a validation function
    const step = steps[currentStep];
    const validationFunc = step.validation ? step.validation[currentQuestionIndex] : null;

    if (validationFunc && !validationFunc(message)) {
      // Show validation error
      let errorMessage = "Please provide a valid ";
      if (step.fields[currentQuestionIndex] === 'email') {
        errorMessage += "email address (e.g., name@example.com)";
      } else if (step.fields[currentQuestionIndex] === 'phone') {
        errorMessage += "phone number with country code";
      }

      setTimeout(() => {
        addBotMessage(errorMessage);
        // Re-ask the same question
        setTimeout(() => askNextQuestion(), 1000);
      }, 1000);
      return;
    }

    // Store the user's response
    userData[step.fields[currentQuestionIndex]] = message;
    currentQuestionIndex++;

    // Ask next question after a delay
    setTimeout(() => askNextQuestion(), 1000);
  } else {
    // Handle free-form questions
    setTimeout(() => {
      if (message.toLowerCase().includes('university') || message.toLowerCase().includes('college')) {
        if (message.toLowerCase().includes('usa') || message.toLowerCase().includes('united states')) {
          userData.country = 'USA';
          currentStep = 3;
          currentQuestionIndex = 0;
          showUniversityOptions();
        } else if (message.toLowerCase().includes('canada')) {
          userData.country = 'Canada';
          currentStep = 3;
          currentQuestionIndex = 0;
          showUniversityOptions();
        } else if (message.toLowerCase().includes('uk') || message.toLowerCase().includes('britain')) {
          userData.country = 'UK';
          currentStep = 3;
          currentQuestionIndex = 0;
          showUniversityOptions();
        } else if (message.toLowerCase().includes('australia')) {
          userData.country = 'Australia';
          currentStep = 3;
          currentQuestionIndex = 0;
          showUniversityOptions();
        } else {
          addBotMessage("I'd be happy to help you find universities. Which country are you interested in studying in?");
          showCountryOptions("");
        }
      } else if (message.toLowerCase().includes('start') || message.toLowerCase().includes('assessment')) {
        startProcess();
      } else {
        addBotMessage("I can help you with study abroad options, university selection, and the application process. Would you like to start a personalized assessment?");

        const optionsDiv = document.createElement('div');
        optionsDiv.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;';
        optionsDiv.innerHTML = `
          <div class="chat-option" onclick="startProcess()">Start Assessment</div>
          <div class="chat-option" onclick="askQuestion('What countries do you work with?')">Study Destinations</div>
          <div class="chat-option" onclick="askQuestion('Tell me about scholarship opportunities')">Scholarships</div>
        `;

        const chatMessages = document.getElementById('chatMessages');
        chatMessages.lastElementChild.appendChild(optionsDiv);
      }
    }, 1000);
  }
}

// Ask a specific question
function askQuestion(question) {
  document.getElementById('chatInput').value = question;
  sendMessage();
}

// Complete the process and connect to agent
function completeProcess() {
  // Show typing indicator
  showTypingIndicator();

  setTimeout(() => {
    removeTypingIndicator();

    // Summary message
    addBotMessage(`Thank you ${userData.name || 'there'}! I've collected all your information.`);

    // Show summary
    const summaryDiv = document.createElement('div');
    summaryDiv.style.cssText = `
      background-color: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 16px;
      margin: 12px 0;
    `;
    summaryDiv.innerHTML = `
      <p><strong>Here's a summary of your study abroad profile:</strong></p>
      <p><strong>Name:</strong> ${userData.name || 'Not provided'}</p>
      <p><strong>Email:</strong> ${userData.email || 'Not provided'}</p>
      <p><strong>Interest:</strong> ${userData.studyLevel || 'Not specified'} in ${userData.field || 'Not specified'}</p>
      <p><strong>Destination:</strong> ${userData.country || 'Not specified'}</p>
      <p><strong>Intake:</strong> ${userData.intake || 'Not specified'}</p>
      ${userData.selectedUniversity ? `<p><strong>University Interest:</strong> ${userData.selectedUniversity}</p>` : ''}
    `;

    const chatMessages = document.getElementById('chatMessages');
    chatMessages.appendChild(summaryDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Connect to agent
    setTimeout(() => {
      addBotMessage("I'm now connecting you with one of our study abroad specialists who will contact you shortly.");

      // Simulate agent connection
      setTimeout(() => {
        const agentDiv = document.createElement('div');
        agentDiv.style.cssText = `
          background-color: #f0f7f4;
          border-left: 3px solid #10a37f;
          padding: 12px;
          border-radius: 4px;
          margin: 12px 0;
        `;
        agentDiv.innerHTML = `
          <p><strong>Study Abroad Specialist:</strong> Hello ${userData.name || 'there'}! I'm Priya, your study abroad consultant at ROYAL Education. Thank you for providing your details.</p>
          <p>I see you're interested in studying ${userData.field || ''} in ${userData.country || 'your preferred destination'}. Based on your profile, I've identified some excellent university options for you.</p>
          <p>I'll contact you at ${userData.email || 'your email'} within the next 24 hours to discuss the next steps, including university selection, application process, and visa requirements.</p>
          <p>Looking forward to helping you achieve your study abroad dreams!</p>
        `;

        chatMessages.appendChild(agentDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 2000);
    }, 2000);
  }, 2000);

  waitingForResponse = false;
}

// Add bot message to chat
function addBotMessage(message) {
  const chatMessages = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.style.cssText = 'display: flex; gap: 12px; margin-bottom: 16px; align-items: flex-start; flex-direction:column;';
  messageDiv.innerHTML = `
    <div style="width: 32px; height: 32px; background-color: #10a37f; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
      <i class="fas fa-robot" style="color: white; font-size: 14px;"></i>
    </div>
    <div style="flex: 1; background-color: #f8f9fa; padding: 12px; border-radius: 12px; border-bottom-left-radius: 4px;">
      <p style="margin: 0; line-height: 1.4;">${message}</p>
    </div>
  `;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add user message to chat
function addUserMessage(message) {
  const chatMessages = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.style.cssText = 'display: flex; gap: 12px; margin-bottom: 16px; align-items: flex-start; justify-content: flex-end;';
  messageDiv.innerHTML = `
    <div style="flex: 1; background-color: #0d1b3e; color: white; padding: 12px; border-radius: 12px; border-bottom-right-radius: 4px; max-width: 80%;">
      <p style="margin: 0; line-height: 1.4;">${message}</p>
    </div>
    <div style="width: 32px; height: 32px; background-color: #0d1b3e; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
      <i class="fas fa-user" style="color: white; font-size: 14px;"></i>
    </div>
  `;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
  const chatMessages = document.getElementById('chatMessages');
  const typingDiv = document.createElement('div');
  typingDiv.id = 'typingIndicator';
  typingDiv.style.cssText = 'display: flex; gap: 12px; margin-bottom: 16px; align-items: flex-start;';
  typingDiv.innerHTML = `
    <div style="width: 32px; height: 32px; background-color: #10a37f; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
      <i class="fas fa-robot" style="color: white; font-size: 14px;"></i>
    </div>
    <div style="flex: 1; background-color: #f8f9fa; padding: 12px; border-radius: 12px; border-bottom-left-radius: 4px;">
      <div style="display: flex; align-items: center; gap: 8px; color: #6e6e80; font-size: 14px;">
        <span>ROYAL Education Assistant is typing</span>
        <div style="display: flex; gap: 4px;">
          <span style="width: 4px; height: 4px; background-color: #6e6e80; border-radius: 50%; animation: typing 1.4s infinite ease-in-out;"></span>
          <span style="width: 4px; height: 4px; background-color: #6e6e80; border-radius: 50%; animation: typing 1.4s infinite ease-in-out 0.2s;"></span>
          <span style="width: 4px; height: 4px; background-color: #6e6e80; border-radius: 50%; animation: typing 1.4s infinite ease-in-out 0.4s;"></span>
        </div>
      </div>
    </div>
  `;
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
  const typingIndicator = document.getElementById('typingIndicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// Initialize on page load
function normalizeInternalLinks() {
  const isInsideLayoutFolder = window.location.pathname.includes('/layout/');

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
      return;
    }

    if (href === '/') {
      link.setAttribute('href', isInsideLayoutFolder ? '../index.html' : './index.html');
      return;
    }

    if (href.startsWith('/layout/')) {
      const slug = href.replace('/layout/', '').replace(/\/$/, '');
      link.setAttribute('href', isInsideLayoutFolder ? `./${slug}.html` : `./layout/${slug}.html`);
      return;
    }

    if (href.startsWith('/about_us')) {
      link.setAttribute('href', isInsideLayoutFolder ? './about_us.html' : './layout/about_us.html');
      return;
    }

    if (href.startsWith('/study_aborad')) {
      link.setAttribute('href', isInsideLayoutFolder ? './study_abroad.html' : './layout/study_abroad.html');
      return;
    }

    if (href.startsWith('/test_preparation')) {
      link.setAttribute('href', isInsideLayoutFolder ? './test_preparation.html' : './layout/test_preparation.html');
      return;
    }

    if (href === '/layout/services' || href.startsWith('/layout/services')) {
      link.setAttribute('href', isInsideLayoutFolder ? './our_services.html' : './layout/our_services.html');
    }
  });
}

function bindForms() {
  const forms = document.querySelectorAll('form.inquiry-form, form.contact-form');

  forms.forEach(form => {
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return;

    if (!form.querySelector('.form-status')) {
      const status = document.createElement('p');
      status.className = 'form-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      form.insertBefore(status, submitButton);
    }

    form.addEventListener('submit', event => {
      event.preventDefault();
      const status = form.querySelector('.form-status');
      const fields = form.querySelectorAll('input, select, textarea');
      const errors = [];
      const originalLabel = submitButton.innerHTML;

      fields.forEach(field => field.classList.remove('is-invalid'));

      const name = (form.querySelector('[name="name"]')?.value || '').trim();
      const email = (form.querySelector('[name="email"]')?.value || '').trim();
      const phone = (form.querySelector('[name="phone"]')?.value || '').trim();
      const message = (form.querySelector('[name="message"]')?.value || '').trim();
      const subject = (form.querySelector('[name="subject"]')?.value || '').trim();
      const country = (form.querySelector('[name="country"]')?.value || '').trim();

      if (!name) errors.push('Please enter your name.');
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Please enter a valid email address.');
      if (!phone || !/^[+]?[[0-9\s\-\(\)]{10,}$/.test(phone)) errors.push('Please enter a valid phone number.');
      if (!message || message.length < 8) errors.push('Please add a short message so we can help.');
      if (form.id === 'contactForm' && !subject) errors.push('Please add a subject.');
      if (form.id === 'inquiryForm' && !country) errors.push('Please select an interested country.');

      if (errors.length) {
        status.textContent = errors[0];
        status.className = 'form-status is-visible error';
        const firstInvalid = form.querySelector('input:invalid, select:invalid, textarea:invalid');
        if (firstInvalid) firstInvalid.classList.add('is-invalid');
        firstInvalid?.focus();
        return;
      }

      if (form.dataset.state === 'submitting') return;
      form.dataset.state = 'submitting';
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      status.textContent = 'Thanks! Your request is being prepared.';
      status.className = 'form-status is-visible success';

      window.setTimeout(() => {
        form.reset();
        submitButton.disabled = false;
        submitButton.innerHTML = originalLabel;
        status.textContent = 'Thanks! We will get back to you shortly.';
        status.className = 'form-status is-visible success';
        form.dataset.state = '';
      }, 1200);
    });
  });
}

function createBackToTopButton() {
  if (document.getElementById('backToTop')) return;

  const button = document.createElement('button');
  button.id = 'backToTop';
  button.className = 'back-to-top';
  button.type = 'button';
  button.setAttribute('aria-label', 'Back to top');
  button.innerHTML = '<i class="fas fa-arrow-up"></i>';
  document.body.appendChild(button);

  const toggleVisibility = () => {
    button.classList.toggle('show', window.scrollY > 500);
  };

  toggleVisibility();
  window.addEventListener('scroll', toggleVisibility, { passive: true });
  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const chatInput = document.getElementById('chatInput');
  const mainContent = document.querySelector('main');

  if (mainContent && !mainContent.id) {
    mainContent.id = 'main-content';
  }

  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  normalizeInternalLinks();
  bindForms();
  createBackToTopButton();

  document.querySelectorAll('img:not([loading])').forEach(img => img.setAttribute('loading', 'lazy'));
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    if (!link.hasAttribute('rel')) {
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  const hamburger = document.getElementById('hamburger');
  const navbarMenu = document.querySelector('.nav > ul');

  if (hamburger && navbarMenu) {
    hamburger.setAttribute('aria-controls', 'navbar-menu');
    hamburger.setAttribute('aria-expanded', 'false');
    navbarMenu.id = 'navbar-menu';

    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('active');
      navbarMenu.classList.toggle('active', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
  }
});

// Export functions for HTML onclick handlers
window.toggleChat = toggleChat;
window.openChat = openChat;
window.closeChat = closeChat;
window.openChatWithCountry = openChatWithCountry;
window.scrollToServices = scrollToServices;
window.startProcess = startProcess;
window.askQuestion = askQuestion;
window.selectProceedOption = selectProceedOption;
window.sendMessage = sendMessage;


// service page services content
const pages = [
  {
    id: 1,
    content: `<article id="career-counseling">
  <h2>Career Counseling</h2>
  <p>
    Deciding on how you want to shape your career, especially at a young age, can be very daunting.
    ROYAL assists you in making career decisions and best-guides you on the path to your career destination.
  </p>
  <p>
    Taking up a higher education program abroad is a huge decision, financially as well as emotionally for both parents
    as well as the students.
    Whether you are a fresh 10 + 2 pass out, a fresh graduate with or without work experience, or a post graduate,
    ROYAL has best options for all.
  </p>
  <p>
    Expert counselors at ROYAL help students in working on their career options after analysis of academics,
    aptitude/interest,
    available finances, chances of scholarships, and location requirements.
  </p>
  <p>
    ROYAL understands the need to comprehend and investigate the career requirement of the students.
    We help you decide on your career based on your interests and skill level. We provide professional support
    and assist students in organizing their opinions and ideas about career options and professional objectives.
    For this, we also conduct Psychometric tests.
  </p>
</article>`,
  },
  {
    id: 2,
    content: `<article id="test-preparation">
  <h2>Test Preparation</h2>
  <p>
    Exams like IELTS, TOEFL, PTE, GMAT, GRE and SAT are considered parameters to judge students’ eligibility
    for admission to specific universities and colleges and to qualify for financial assistance for higher studies abroad.
  </p>
  <p>
    Many reputed universities across the United Kingdom, USA, Australia and other countries recognize some or many of these tests.
    The scores in these exams may also define the students’ eligibility for visas and scholarships.
  </p>
  <h3>GMAT</h3>
  <p>
    The Graduate Management Admission Test (GMAT) is a computer adaptive test that reviews investigative,
    quantitative, writing, spoken, and reading capabilities in standard written English for admission into graduate management programs.
  </p>
  <h3>GRE</h3>
  <p>
    The Graduate Record Examinations (GRE) is a standardized test required for admission to graduate schools in the United States
    and other English-speaking countries. It measures verbal reasoning, analytical writing, and quantitative reasoning skills.
  </p>
  <h3>SAT</h3>
  <p>
    A standardized test conducted for admission to various U.S. colleges, the SAT assesses students’ capability and eligibility
    for college admission. The SAT score ranges from 600 to 2400 across three 800-point sections: mathematics, reading, and writing.
  </p>
  <h3>IELTS</h3>
  <p>
    The International English Language Testing System (IELTS) measures English proficiency. Managed by Cambridge ESOL,
    British Council, and IDP, it has two editions — Academic and General Training — for study or work purposes.
  </p>
  <h3>TOEFL iBT</h3>
  <p>
    TOEFL-iBT is designed to assess the English skills of non-native speakers. Managed globally by ETS,
    it is widely used for admission to universities where English is the official language.
  </p>
  <h3>PTE</h3>
  <p>
    The Pearson Test of English Academic (PTE) is accepted by institutions in the UK, Australia, USA, and other countries.
    It is recognized by UK Border Agency and Australian DIAC for student visas.
  </p>
</article>`,
  },
  {
    id: 3,
    content: `<article id="university-selection">
  <h2>University Selection</h2>
  <p>
    Students looking for postgraduate and doctorate-level studies abroad should select universities with worldwide recognition
    and excellent educational standards. At ROYAL, we inform students about study options and guide them in making the final call
    on selecting the right university.
  </p>
</article>`,
  },
  {
    id: 4,
    content: `<article id="admission-guidance">
  <h2>Admission Guidance and SOP Preparation</h2>
  <p>
    ROYAL assists students in filling up admission forms, preparing financials, managing documentation, and applying for visas.
    Our counselors help students at every step to realize their dream of studying abroad.
  </p>
  <p>
    Colleges and universities require a Statement of Purpose (SOP) to understand your motivation for studying abroad,
    your academic background, and your study goals. ROYAL helps make your SOP more convincing and aligned with university requirements.
  </p>
</article>`,
  },
  {
    id: 5,
    content: `<article id="scholarship-guidance">
  <h2>Scholarship Guidance</h2>
  <p>
    While all financial awards are at the discretion of the university’s Scholarship Committee,
    many deserving students miss out due to poor presentation of their potential.
    At ROYAL, we help students highlight their strengths and achievements to increase scholarship success.
  </p>
  <p>
    We also emphasize programs offering internships, placements, and practical exposure
    to help students gain workplace experience before graduation.
  </p>
  <p>
    In short, we assist deserving and eligible students in securing scholarships and financial aid.
  </p>
</article>`,
  },
  {
    id: 6,
    content: `<article id="study-visa-assistance">
  <h2>Study Visa Assistance</h2>
  <p>
    ROYAL offers complete guidance throughout the visa process — from filling applications,
    preparing financial statements, to conducting mock interviews.
  </p>
  <p>
    We help students prepare visa files as per embassy requirements, ensuring 100% visa success.
    Our rich database also helps students prepare effectively for visa interviews.
  </p>
</article>`,
  },
  {
    id: 7,
    content: `<article id="financial-assistance">
  <h2>Financial Assistance</h2>
  <p>
    ROYAL explains the complete expenditure involved in studying abroad
    and offers guidance on financial planning to meet university requirements.
    We assist students in arranging finances efficiently and transparently.
  </p>
</article>`,
  },
  {
    id: 8,
    content: `<article id="travel-assistance">
  <h2>Travel Assistance</h2>
  <p>
    ROYAL ensures students’ journeys are comfortable and stress-free.
    We assist not only with flight bookings but also with travel from the airport
    to the accommodation or university campus.
  </p>
  <p>
    We offer travel tips, book flights in advance, and secure discounted rates to ensure
    ideal departure dates and routes. This service is offered free of cost.
  </p>
</article>`,
  },
  {
    id: 9,
    content: `<article id="forex-assistance">
  <h2>Forex Assistance</h2>
  <p>
    ROYAL provides quick and competitive foreign exchange services
    to cover tuition, lodging, and other educational expenses.
    Whatever your foreign exchange needs are, ROYAL is always there to assist.
  </p>
</article>`,
  },
];

const container = document.getElementById("content-container");
const body = document.getElementById("content-body");

function openContent(pageId) {
  const page = pages.find(p => p.id === pageId);
  if (!page) return;

  // If already visible, fade out old content first
  if (container.classList.contains("active")) {
    container.classList.remove("active");
    setTimeout(() => {
      body.innerHTML = page.content;
      container.classList.add("active");
    }, 400); // Wait for fade-out animation
  } else {
    body.innerHTML = page.content;
    container.style.display = "block";
    setTimeout(() => container.classList.add("active"), 50);
  }
}

function closeContent() {
  container.classList.remove("active");
  setTimeout(() => {
    container.style.display = "none";
    body.innerHTML = "";
  }, 400);
}
// window.renderServices = renderServices;

// Hamburger menu functionality
$('.hamburger').click(function () {
  $(this).toggleClass('active');
  $('.nav > ul').toggleClass('active');
});

// sroll animatin
const reveals = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const ratio = entry.intersectionRatio;

    // 👇 When 10% or more visible → show
    if (ratio > 0.05) {
      entry.target.classList.add("active");
    }

    // 👇 When less than 20% visible → hide again
    else if (ratio < 0.2) {
      entry.target.classList.remove("active");
    }
  });
}, {
  threshold: [0, 0.1, 0.2, 0.5, 0.8, 1], // fine-grained thresholds
  rootMargin: "0px 0px -10% 0px"
});

reveals.forEach(r => observer.observe(r));



// Enhanced Service Section Functionality
function openServiceModal(serviceType) {
  const serviceData = {
    'career-counseling': {
      title: 'Career Counseling',
      description: 'Our expert career counselors provide personalized guidance to help you make informed decisions about your academic and professional future.',
      features: [
        'Comprehensive aptitude and personality assessments',
        'Industry trend analysis and career mapping',
        'One-on-one counseling sessions with experts',
        'Academic pathway recommendations',
        'Skills gap analysis and development plans'
      ],
      benefits: 'Make confident decisions about your future with data-driven insights and expert guidance.'
    },
    'university-selection': {
      title: 'University Selection',
      description: 'Find the perfect university that aligns with your academic goals, budget, and career aspirations through our comprehensive selection process.',
      features: [
        'Access to 500+ partner universities worldwide',
        'Detailed program and ranking analysis',
        'Budget and scholarship compatibility matching',
        'Campus culture and location assessment',
        'Alumni network and placement record review'
      ],
      benefits: 'Choose the right university with confidence using our extensive database and expert insights.'
    },
    'test-preparation': {
      title: 'Test Preparation',
      description: 'Excel in standardized tests with our comprehensive preparation programs designed for maximum score improvement.',
      features: [
        'IELTS, TOEFL, SAT, GRE, GMAT preparation',
        'Expert trainers with proven track records',
        'Unlimited practice tests and mock exams',
        'Personalized study plans and progress tracking',
        'Small batch sizes for individual attention'
      ],
      benefits: 'Achieve your target scores with our proven methodology and expert guidance.'
    },
    'application-support': {
      title: 'Application Support',
      description: 'Get comprehensive assistance with your university applications, from document preparation to submission.',
      features: [
        'Statement of Purpose (SOP) writing and review',
        'Letter of Recommendation guidance',
        'Application form completion assistance',
        'Document verification and formatting',
        'Deadline management and submission tracking'
      ],
      benefits: 'Maximize your admission chances with professionally crafted applications.'
    },
    'visa-assistance': {
      title: 'Visa Assistance',
      description: 'Navigate the complex visa process with our experienced team ensuring a smooth and successful application.',
      features: [
        'Complete visa documentation preparation',
        'Embassy interview preparation and training',
        'Visa application form assistance',
        'Financial documentation guidance',
        'Post-visa approval support'
      ],
      benefits: 'Secure your student visa with our 95% success rate and expert guidance.'
    },
    'scholarship-guidance': {
      title: 'Scholarship Guidance',
      description: 'Discover and apply for scholarships and financial aid opportunities to make your education more affordable.',
      features: [
        'Merit-based and need-based scholarship search',
        'Application essay writing assistance',
        'Scholarship interview preparation',
        'Financial aid application support',
        'Alternative funding options exploration'
      ],
      benefits: 'Reduce your education costs significantly with our scholarship expertise.'
    },
    'financial-assistance': {
      title: 'Financial Planning',
      description: 'Comprehensive financial planning and education loan assistance for your study abroad investment.',
      features: [
        'Education loan application assistance',
        'Budget planning and cost estimation',
        'Bank liaison and documentation support',
        'Loan comparison and best rate finding',
        'Financial planning workshops'
      ],
      benefits: 'Secure the best financial options for your education with expert guidance.'
    },
    'pre-departure': {
      title: 'Pre-Departure Support',
      description: 'Complete preparation for your international journey including travel, accommodation, and cultural orientation.',
      features: [
        'Flight booking and travel arrangements',
        'Accommodation assistance and booking',
        'Cultural orientation and country briefings',
        'Airport pickup coordination',
        'Essential documents checklist'
      ],
      benefits: 'Start your international journey with confidence and complete preparation.'
    }
  };

  const service = serviceData[serviceType];
  if (!service) return;

  // Create modal HTML
  const modalHTML = `
    <div class="service-modal-overlay" id="serviceModal">
      <div class="service-modal">
        <div class="service-modal-header">
          <h2>${service.title}</h2>
          <button class="modal-close" onclick="closeServiceModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="service-modal-content">
          <p class="service-description">${service.description}</p>
          
          <div class="service-details">
            <h3>What We Offer:</h3>
            <ul class="service-features-list">
              ${service.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
            </ul>
          </div>
          
          <div class="service-benefits">
            <h3>Why Choose Us:</h3>
            <p>${service.benefits}</p>
          </div>
          
          <div class="service-modal-actions">
            <button class="cta-button primary" onclick="closCard()">Get Started</button>
            <button class="cta-button secondary" onclick="closeServiceModal()">Learn More</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Show modal with animation
  setTimeout(() => {
    document.getElementById('serviceModal').classList.add('active');
  }, 10);
}

function closeServiceModal() {
  const modal = document.getElementById('serviceModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// Close modal when clicking outside
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('service-modal-overlay')) {
    closeServiceModal();
  }
});

// Enhanced scroll to services function
function scrollToServices() {
  const servicesSection = document.getElementById('services');
  if (servicesSection) {
    servicesSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}//
// Fixed Navigation Scroll Effects
document.addEventListener('DOMContentLoaded', function () {
  const header = document.querySelector('header');
  let lastScrollTop = 0;

  if (header) {
    window.addEventListener('scroll', function () {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Add scrolled class when user scrolls down
      if (scrollTop > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScrollTop = scrollTop;
    });
  }
});

// Smooth scroll for anchor links to account for fixed header
document.addEventListener('DOMContentLoaded', function () {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');

      if (href !== '#' && href.length > 1) {
        e.preventDefault();

        const target = document.querySelector(href);
        if (target) {
          const headerHeight = document.querySelector('header').offsetHeight;
          const targetPosition = target.offsetTop - headerHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
});

// ===== USA DESTINATION PAGE JAVASCRIPT START =====

// Modal functionality for information cards
function openModal(pageType) {
  const modal = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  // Content for different pages
  const modalContent = {
    'document-checklist': {
      title: 'Document Checklist for USA Study Visa',
      content: `
            <h4>Required Documents:</h4>
            <ul>
              <li>Valid Passport (minimum 6 months validity)</li>
              <li>I-20 Form from your chosen university</li>
              <li>DS-160 Form confirmation</li>
              <li>SEVIS Fee Receipt</li>
              <li>Academic Transcripts and Certificates</li>
              <li>English Proficiency Test Scores (TOEFL/IELTS)</li>
              <li>Standardized Test Scores (SAT/GRE/GMAT if required)</li>
              <li>Financial Documents (Bank statements, Scholarship letters)</li>
              <li>Statement of Purpose</li>
              <li>Letters of Recommendation</li>
            </ul>
            <h4>Additional Tips:</h4>
            <p>Ensure all documents are properly translated and notarized if required. Keep both original and photocopies ready for your visa interview.</p>
          `
    },
    'education-system': {
      title: 'USA Education System',
      content: `
            <h4>Higher Education Structure:</h4>
            <p><strong>Undergraduate Programs (4 years):</strong> Bachelor's degrees with liberal arts foundation</p>
            <p><strong>Graduate Programs (1-2 years):</strong> Master's degrees with specialization</p>
            <p><strong>Doctoral Programs (3-7 years):</strong> PhD and professional degrees</p>
            <h4>Academic Features:</h4>
            <ul>
              <li>Credit-based system with flexibility</li>
              <li>Semester or quarter system</li>
              <li>Research-oriented approach</li>
              <li>Practical training opportunities (OPT/CPT)</li>
              <li>Liberal arts education emphasizing critical thinking</li>
              <li>Extensive extracurricular activities</li>
            </ul>
          `
    },
    'colleges-universities': {
      title: 'Top Colleges & Universities in USA',
      content: `
            <h4>Ivy League Universities:</h4>
            <ul>
              <li>Harvard University - Cambridge, MA</li>
              <li>Stanford University - Stanford, CA</li>
              <li>MIT - Cambridge, MA</li>
              <li>Yale University - New Haven, CT</li>
              <li>Princeton University - Princeton, NJ</li>
              <li>Columbia University - New York, NY</li>
            </ul>
            <h4>Top Public Universities:</h4>
            <ul>
              <li>University of California System (UCLA, UC Berkeley)</li>
              <li>University of Michigan - Ann Arbor</li>
              <li>University of Texas - Austin</li>
              <li>Georgia Institute of Technology</li>
              <li>University of Washington</li>
            </ul>
            <p><strong>Note:</strong> Royal Educational Foundation has partnerships with over 200+ universities across the USA to help you find the perfect match for your academic goals.</p>
          `
    },
    'interview-preparation': {
      title: 'Interview Preparation Guide',
      content: `
            <h4>Visa Interview Tips:</h4>
            <ul>
              <li>Be confident and honest in your responses</li>
              <li>Clearly explain your study plans and career goals</li>
              <li>Demonstrate strong ties to your home country</li>
              <li>Show sufficient financial resources</li>
              <li>Practice common interview questions</li>
              <li>Dress professionally and arrive early</li>
            </ul>
            <h4>Common Questions:</h4>
            <ul>
              <li>Why do you want to study in the USA?</li>
              <li>Why did you choose this university/program?</li>
              <li>How will you finance your studies?</li>
              <li>What are your plans after graduation?</li>
              <li>Do you have any relatives in the USA?</li>
            </ul>
            <p><strong>Royal's Support:</strong> We provide comprehensive mock interview sessions and personalized coaching to ensure your success.</p>
          `
    },
    'why-royal': {
      title: 'Why Choose Royal Educational Foundation',
      content: `
            <h4>Our Advantages:</h4>
            <ul>
              <li><strong>15+ years</strong> of experience in international education</li>
              <li><strong>98% visa success rate</strong> for qualified candidates</li>
              <li>Partnerships with <strong>200+ universities</strong> worldwide</li>
              <li>Personalized counseling and guidance</li>
              <li>Complete application support from start to finish</li>
              <li>Pre-departure orientation programs</li>
              <li>Post-arrival support services</li>
              <li>Scholarship guidance and financial aid assistance</li>
            </ul>
            <h4>Success Stories:</h4>
            <p>Over <strong>5000+ students</strong> successfully placed in top universities across the USA. Our alumni network spans across major cities in America, providing ongoing support and networking opportunities.</p>
            <h4>Services Included:</h4>
            <ul>
              <li>University selection and application assistance</li>
              <li>Visa documentation and interview preparation</li>
              <li>Test preparation (TOEFL, IELTS, SAT, GRE, GMAT)</li>
              <li>Accommodation and travel arrangements</li>
            </ul>
          `
    },
    'usa-facts': {
      title: 'Interesting Facts about USA',
      content: `
            <h4>Education Facts:</h4>
            <ul>
              <li>Home to <strong>4,000+ universities and colleges</strong></li>
              <li>Hosts over <strong>1 million international students</strong> annually</li>
              <li><strong>60+ universities</strong> in top 200 global rankings</li>
              <li><strong>$600+ billion</strong> invested in higher education annually</li>
              <li>Over <strong>200 different majors</strong> available across institutions</li>
            </ul>
            <h4>Cultural & Lifestyle:</h4>
            <ul>
              <li><strong>50 states</strong> with diverse cultures and climates</li>
              <li>English is the primary language</li>
              <li>Strong emphasis on innovation and entrepreneurship</li>
              <li>Excellent public transportation in major cities</li>
              <li>Rich cultural diversity with students from 200+ countries</li>
              <li>Extensive campus facilities including libraries, labs, and sports centers</li>
            </ul>
            <h4>Career Opportunities:</h4>
            <ul>
              <li>Optional Practical Training (OPT) for up to 3 years</li>
              <li>Strong job market in technology, healthcare, and business</li>
              <li>Average starting salary for international graduates: $50,000-$80,000</li>
            </ul>
          `
    }
  };

  const content = modalContent[pageType];
  if (content) {
    modalTitle.textContent = content.title;
    modalBody.innerHTML = content.content;
    modal.style.display = 'flex';
  }
}

function closeModal() {
  document.getElementById('modalOverlay').style.display = 'none';
}

// Add click event listeners to all clickable cards
document.addEventListener('DOMContentLoaded', function () {
  const clickableCards = document.querySelectorAll('.clickable-card');

  clickableCards.forEach(card => {
    card.addEventListener('click', function () {
      const pageType = this.getAttribute('data-page');
      openModal(pageType);
    });
  });

  // Close modal when clicking outside
  let modaloverlay = document.getElementById('modalOverlay');
  if (modaloverlay) {
    modaloverlay.addEventListener('click', function (e) {
      if (e.target === this) {
        closeModal();
      }
    });
  }

  // Close modal with Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
});

// ===== USA DESTINATION PAGE JAVASCRIPT END =====


// ===== GMAT TEST PREPARATION PAGE JAVASCRIPT START =====

// Form submission handler
// document.getElementById('gmatEnrollmentForm').addEventListener('submit', function (e) {
//   e.preventDefault();

//   // Get form data
//   const formData = new FormData(this);
//   const data = Object.fromEntries(formData);

//   // Show success message
//   alert('Thank you for your interest in our GMAT course! We will contact you soon.');

//   // Reset form
//   this.reset();
// });

// Animation on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
    }
  });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right').forEach(el => {
  animObserver.observe(el);
});

// ===== GMAT TEST PREPARATION PAGE JAVASCRIPT END =====