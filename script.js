// Global state
let currentSection = 'welcome';
let participantName = '';
let completionDate = '';
const totalModules = 4;
let currentModule = 0;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateProgress();
});

// Start training
function startTraining() {
    const nameInput = document.getElementById('participantName');
    participantName = nameInput.value.trim();
    
    if (!participantName) {
        alert('Bitte geben Sie Ihren Namen ein.');
        nameInput.focus();
        return;
    }
    
    goToSection('module1');
    currentModule = 1;
    updateProgress();
}

// Navigate to section
function goToSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionId;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Previous section
function previousSection() {
    const sectionOrder = ['welcome', 'module1', 'module2', 'module3', 'module4', 'completion'];
    const currentIndex = sectionOrder.indexOf(currentSection);
    
    if (currentIndex > 0) {
        const previousSectionId = sectionOrder[currentIndex - 1];
        goToSection(previousSectionId);
        
        // Update module tracking
        if (previousSectionId.startsWith('module')) {
            currentModule = parseInt(previousSectionId.replace('module', ''));
        } else if (previousSectionId === 'welcome') {
            currentModule = 0;
        }
        updateProgress();
    }
}

// Check answer and proceed
function checkAnswer(questionId, nextSectionId) {
    const selectedOption = document.querySelector(`input[name="${questionId}"]:checked`);
    const feedbackDiv = document.getElementById(`${questionId}-feedback`);
    
    if (!selectedOption) {
        alert('Bitte wählen Sie eine Antwort aus.');
        return;
    }
    
    const isCorrect = selectedOption.value === 'correct';
    
    if (isCorrect) {
        feedbackDiv.textContent = '✓ Richtig! Sie können fortfahren.';
        feedbackDiv.className = 'feedback correct';
        
        // Allow navigation to next section after a brief delay
        setTimeout(() => {
            goToSection(nextSectionId);
            
            // Update module tracking
            if (nextSectionId.startsWith('module')) {
                currentModule = parseInt(nextSectionId.replace('module', ''));
            } else if (nextSectionId === 'completion') {
                currentModule = totalModules;
                completeTraining();
            }
            updateProgress();
        }, 1500);
    } else {
        feedbackDiv.textContent = '✗ Leider falsch. Bitte lesen Sie den Inhalt noch einmal durch und versuchen Sie es erneut.';
        feedbackDiv.className = 'feedback incorrect';
        
        // Clear the selection
        selectedOption.checked = false;
        
        // Hide feedback after a few seconds
        setTimeout(() => {
            feedbackDiv.style.display = 'none';
        }, 5000);
    }
}

// Complete training
function completeTraining() {
    const now = new Date();
    completionDate = now.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    document.getElementById('certificateName').textContent = participantName;
    document.getElementById('completionDate').textContent = completionDate;
    
    // Store completion in localStorage
    const completionData = {
        name: participantName,
        date: completionDate,
        timestamp: now.toISOString()
    };
    localStorage.setItem('auditTrainingCompletion', JSON.stringify(completionData));
}

// Update progress bar
function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressPercentage = (currentModule / totalModules) * 100;
    progressFill.style.width = progressPercentage + '%';
}

// Generate certificate
function generateCertificate() {
    // Populate certificate with data
    document.getElementById('certName').textContent = participantName;
    document.getElementById('certDate').textContent = completionDate;
    
    // Use html2canvas to generate PDF
    const certificateElement = document.getElementById('certificate');
    
    // Temporarily make certificate visible for rendering
    certificateElement.style.position = 'fixed';
    certificateElement.style.top = '0';
    certificateElement.style.left = '0';
    certificateElement.style.zIndex = '9999';
    
    // Load html2canvas from CDN if not already loaded
    if (typeof html2canvas === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = function() {
            renderCertificate(certificateElement);
        };
        document.head.appendChild(script);
    } else {
        renderCertificate(certificateElement);
    }
}

// Render certificate
function renderCertificate(certificateElement) {
    html2canvas(certificateElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        width: 800,
        height: 1000
    }).then(canvas => {
        // Hide certificate again
        certificateElement.style.position = 'fixed';
        certificateElement.style.top = '-9999px';
        certificateElement.style.left = '-9999px';
        
        // Convert to blob and download
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const fileName = `Zertifikat_Internes_Audit_${participantName.replace(/\s+/g, '_')}_${completionDate.replace(/\./g, '-')}.png`;
            link.href = url;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(url);
        });
    }).catch(error => {
        console.error('Error generating certificate:', error);
        alert('Fehler beim Erstellen des Zertifikats. Bitte versuchen Sie es erneut.');
        certificateElement.style.position = 'fixed';
        certificateElement.style.top = '-9999px';
        certificateElement.style.left = '-9999px';
    });
}

// Alternative: Print certificate
function printCertificate() {
    document.getElementById('certName').textContent = participantName;
    document.getElementById('certDate').textContent = completionDate;
    
    const certificateElement = document.getElementById('certificate');
    certificateElement.style.position = 'static';
    
    const originalContents = document.body.innerHTML;
    const certificateContents = certificateElement.outerHTML;
    
    document.body.innerHTML = certificateContents;
    window.print();
    document.body.innerHTML = originalContents;
    
    // Reinitialize
    location.reload();
}

// Restart training
function restartTraining() {
    if (confirm('Möchten Sie die Unterweisung wirklich erneut durchführen?')) {
        currentSection = 'welcome';
        currentModule = 0;
        participantName = '';
        completionDate = '';
        
        // Clear all radio selections
        const radios = document.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.checked = false;
        });
        
        // Clear all feedback
        const feedbacks = document.querySelectorAll('.feedback');
        feedbacks.forEach(feedback => {
            feedback.className = 'feedback';
            feedback.textContent = '';
        });
        
        // Reset input
        document.getElementById('participantName').value = '';
        
        goToSection('welcome');
        updateProgress();
    }
}

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        const backButton = document.querySelector('.section.active .btn-secondary');
        if (backButton && backButton.textContent === 'Zurück') {
            backButton.click();
        }
    } else if (event.key === 'ArrowRight' || event.key === 'Enter') {
        const nextButton = document.querySelector('.section.active .btn-primary');
        if (nextButton && document.activeElement.tagName !== 'INPUT') {
            event.preventDefault();
            nextButton.click();
        }
    }
});
