//Your JavaScript goes in here

// Corpus-specific explanations for test sentences
const testSentenceExplanations = {
  corpus1: {
    title: "Why this Test Sentence for Corpus A?",
    content: `The simulation uses two different sentences for two distinct purposes, which is a common practice in natural language processing tasks.
    <br><br>
    <strong>The Training Corpus:</strong> The longer sentence, <em>"Book a car. Park the car. The book is in the car. The car is in a park."</em>, serves as the training data. The simulation analyzes this text to calculate the Transition Probabilities (the likelihood of one part-of-speech tag following another) and Emission Probabilities (the likelihood of a word corresponding to a specific tag). You see these probabilities in the two matrices at the top of the simulation.
    <br><br>
    <strong>The Test Sentence:</strong> The shorter sentence, <em>"Book a park"</em>, is the test sentence. Your task in the simulation is to apply the Viterbi algorithm to this sentence, using the probabilities derived from the larger training corpus. The goal is to find the most likely sequence of part-of-speech tags for "Book a park".
    <br><br>
    In short, the long sentence isn't being converted into the short one. Rather, the long sentence is used to build the statistical model, and the short sentence is the specific problem you need to solve using that model. This mimics a real-world scenario where you would train a model on a large amount of text and then use it to analyze new, unseen sentences.`,
  },
  corpus2: {
    title: "Why this Test Sentence for Corpus B?",
    content: `The simulation uses two different sentences for two distinct purposes, which is a common practice in natural language processing tasks.
    <br><br>
    <strong>The Training Corpus:</strong> The longer sentence, <em>"The quick brown fox jumps over the lazy dog."</em>, serves as the training data. This classic pangram contains most letters of the alphabet and provides a rich dataset for calculating Transition Probabilities (how likely one POS tag follows another) and Emission Probabilities (how likely a word corresponds to a specific tag). These probabilities are displayed in the matrices above.
    <br><br>
    <strong>The Test Sentence:</strong> The shorter sentence, <em>"The quick fox jumps"</em>, is the test sentence. Your task is to apply the Viterbi algorithm to determine the most probable sequence of POS tags for these words, using the statistical patterns learned from the training corpus.
    <br><br>
    This demonstrates how NLP models work: they learn patterns from large training datasets and apply that knowledge to analyze new, unseen text. The training corpus builds the statistical foundation, while the test sentence represents the real-world application of that learned knowledge.`,
  },
  corpus3: {
    title: "Why this Test Sentence for Corpus C?",
    content: `The simulation uses two different sentences for two distinct purposes, which is a common practice in natural language processing tasks.
    <br><br>
    <strong>The Training Corpus:</strong> The longer sentence, <em>"She sells sea shells by the sea shore."</em>, serves as the training data. This alliterative tongue-twister provides training data for calculating Transition Probabilities (sequence patterns between POS tags) and Emission Probabilities (word-to-tag mappings). The matrices above show these learned probabilities.
    <br><br>
    <strong>The Test Sentence:</strong> The shorter sentence, <em>"She sells shells"</em>, is the test sentence. Your challenge is to use the Viterbi algorithm to find the most likely POS tag sequence for these words, based on the patterns learned from the training corpus.
    <br><br>
    This illustrates the core principle of statistical NLP: learn from larger datasets to make predictions about smaller, new inputs. The training sentence teaches the model about language patterns, while the test sentence tests the model's ability to apply that knowledge to new text.`,
  },
};

// Function to show test sentence explanation modal
function showTestSentenceInfo() {
  const explanation = testSentenceExplanations[currentCorpusKey];
  if (!explanation) return;

  // Create modal HTML
  const modalHtml = `
    <div id="test-sentence-modal" class="modal-overlay" onclick="closeTestSentenceModal(event)">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>${explanation.title}</h3>
          <button class="modal-close" onclick="closeTestSentenceModal()" aria-label="Close modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          ${explanation.content}
        </div>
        <div class="modal-footer">
          <button class="sim-button" onclick="closeTestSentenceModal()">Close</button>
        </div>
      </div>
    </div>
  `;

  // Add modal to body
  $("body").append(modalHtml);

  // Show modal with animation
  $("#test-sentence-modal").fadeIn(200);

  // Focus management for accessibility
  $("#test-sentence-modal .modal-close").focus();

  // Handle ESC key
  $(document).on("keydown.modal", function (e) {
    if (e.key === "Escape") {
      closeTestSentenceModal();
    }
  });
}

// Function to close test sentence explanation modal
function closeTestSentenceModal(event) {
  if (
    event &&
    event.target !== event.currentTarget &&
    !$(event.target).hasClass("modal-close")
  ) {
    return;
  }

  $("#test-sentence-modal").fadeOut(200, function () {
    $(this).remove();
  });

  // Remove ESC key handler
  $(document).off("keydown.modal");

  // Return focus to info icon
  $(".info-icon").focus();
}

// Setup instructions panel functionality
function setupInstructionsPanel() {
  const tab = document.getElementById("instructionsTab");
  const instructionsContent = document.getElementById("instructionsContent");

  if (tab && instructionsContent) {
    // Collapsed by default
    instructionsContent.classList.add("collapsed");
    tab.classList.add("collapsed");

    tab.addEventListener("click", () => {
      const isCollapsed = instructionsContent.classList.contains("collapsed");
      if (isCollapsed) {
        instructionsContent.classList.remove("collapsed");
        tab.classList.remove("collapsed");
      } else {
        instructionsContent.classList.add("collapsed");
        tab.classList.add("collapsed");
      }
    });
  }
}

// Function to synchronize instructions panel width with main-2pane-container
function syncInstructionsPanelWidth() {
  const instructionsPanel = document.querySelector(".instructions-panel");
  const main2paneContainer = document.getElementById("main-2pane-container");

  if (instructionsPanel && main2paneContainer) {
    // Get the computed width of main-2pane-container
    const containerWidth = main2paneContainer.offsetWidth;

    // Apply the same width to instructions panel
    instructionsPanel.style.width = containerWidth + "px";
  }
}

// Function to setup width synchronization with observers and event listeners
function setupWidthSynchronization() {
  // Initial sync
  syncInstructionsPanelWidth();

  // Sync on window resize
  window.addEventListener("resize", () => {
    // Use requestAnimationFrame to ensure layout is updated
    requestAnimationFrame(syncInstructionsPanelWidth);
  });

  // Create a ResizeObserver to watch for changes in main-2pane-container
  if (window.ResizeObserver) {
    const main2paneContainer = document.getElementById("main-2pane-container");
    if (main2paneContainer) {
      const resizeObserver = new ResizeObserver(() => {
        syncInstructionsPanelWidth();
      });
      resizeObserver.observe(main2paneContainer);
    }
  }

  // Create a MutationObserver to watch for content changes that might affect width
  const main2paneContainer = document.getElementById("main-2pane-container");
  if (main2paneContainer) {
    const mutationObserver = new MutationObserver(() => {
      // Delay to allow DOM updates to complete
      setTimeout(syncInstructionsPanelWidth, 100);
    });

    mutationObserver.observe(main2paneContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
  }
}

// Load corpora.json and populate dropdown
$(document).ready(function () {
  // Setup instructions panel first
  setupInstructionsPanel();

  // Setup width synchronization
  setupWidthSynchronization();

  // Setup matrix toggles
  setupMatrixToggles();

  $.getJSON("data/corpora.json", function (corpora) {
    // Create dropdown with modern styling
    var $select = $('<select name="option" id="corpus-select"></select>');
    $select.append('<option value="">Select Corpus</option>');
    corpora.forEach(function (corpus, idx) {
      $select.append(
        '<option value="' + corpus.filename + '">' + corpus.label + "</option>"
      );
    });

    // Add to corpus selection section with proper styling
    $("#corpus").html('<div class="sim-section-title">Corpus Selection</div>');
    $("#corpus").append($select);

    // Clear other sections
    $("#full-sentence").html("");
    $("#fldiv").html("");
    $("#matrices-pane").html("");
    $("#emission-matrix-container").html("");
    $("#transition-matrix-container").html("");

    // Select Corpus A by default and trigger change
    setTimeout(function () {
      currentCorpusKey = "corpus1";
      $select.val("corpus1").trigger("change");
    }, 0);

    $select.on("change", function () {
      const selected = $(this).val();
      if (!selected) {
        $("#full-sentence").html("");
        $("#fldiv").html("");
        $("#matrices-pane").html("");
        $("#emission-matrix-container").html("");
        $("#transition-matrix-container").html("");
        $("#viterbi-feedback").hide();
        $("#sim-hint").hide();
        currentCorpusKey = null;
        return;
      }
      // Reset all state
      userAnswers = [];
      simulationComplete = false;
      currentTurn = 1;
      currentCorpusKey = selected;
      // Hide feedback and hints when changing corpus
      $("#viterbi-feedback").hide();
      $("#sim-hint").hide();
      // Load and render the new corpus
      $.ajax({
        url: "data/" + selected,
        dataType: "text",
        success: function (data) {
          const corpusObj = parseCorpus(data);
          // Render test sentence and matrices in left pane
          $("#full-sentence").html(
            '<div class="sim-sentence-header">' +
              '<span class="sim-section-title">Entire sentence</span>' +
              '<div class="sim-sentence-text">' +
              corpusObj.fullSentence +
              "</div>" +
              "</div>"
          );
          // Render collapsible matrices
          renderCollapsibleMatrices(corpusObj);
          // Render simulation in right pane
          renderSimulation(corpusObj);

          // Sync instructions panel width after content is loaded
          setTimeout(syncInstructionsPanelWidth, 100);
        },
        error: function () {
          $("#full-sentence").html("");
          $("#fldiv").html(
            '<div class="feedback-message feedback-error">Failed to load corpus file.</div>'
          );
          $("#matrices-pane").html("");
          $("#emission-matrix-container").html("");
          $("#transition-matrix-container").html("");
        },
      });
    });
  });
});

function parseCorpus(data) {
  // Split by lines and remove empty lines
  const lines = data.split(/\r?\n/).filter((line) => line.trim() !== "");
  let idx = 0;
  const result = {};
  // 1. Full sentence
  if (!lines[idx])
    throw new Error("Corpus file missing full sentence at line 1");
  result.fullSentence = lines[idx++];
  // 2. Words
  if (!lines[idx]) throw new Error("Corpus file missing words at line 2");
  result.words = lines[idx++].split(/\s+/);
  // 3. POS tags
  if (!lines[idx]) throw new Error("Corpus file missing POS tags at line 3");
  result.pos = lines[idx++].split(/\s+/);
  // 4. Emission matrix (POS x Words)
  result.emission = [];
  for (let i = 0; i < result.pos.length; i++) {
    if (!lines[idx])
      throw new Error(
        "Corpus file missing emission matrix row at line " + (idx + 1)
      );
    result.emission.push(lines[idx++].split(/\s+/).map(Number));
  }
  // 5. Transition matrix (POS x POS)
  result.transition = [];
  for (let i = 0; i < result.pos.length; i++) {
    if (!lines[idx])
      throw new Error(
        "Corpus file missing transition matrix row at line " + (idx + 1)
      );
    result.transition.push(lines[idx++].split(/\s+/).map(Number));
  }
  // 6. Sentence to decode
  if (!lines[idx])
    throw new Error(
      "Corpus file missing sentence to decode at line " + (idx + 1)
    );
  result.sentence = lines[idx++];
  // 7. Viterbi matrix (POS x Words in sentence)
  const sentenceWords = result.sentence.split(/\s+/);
  result.viterbi = [];
  for (let i = 0; i < result.pos.length; i++) {
    if (!lines[idx])
      throw new Error(
        "Corpus file missing viterbi matrix row at line " + (idx + 1)
      );
    result.viterbi.push(lines[idx++].split(/\s+/).map(Number));
  }
  // 8. POS for sentence
  if (!lines[idx])
    throw new Error(
      "Corpus file missing POS for sentence at line " + (idx + 1)
    );
  result.sentencePos = lines[idx++].split(/\s+/);
  return result;
}

// Initialize modern styling for the simulation
(function () {
  // All styles are now in main.css for better organization
  // This function can be used for any dynamic style adjustments if needed
  console.log("Viterbi Decoding experiment styles loaded from main.css");
})();

// Hints for each step (can be expanded)
const viterbiHints = [
  "Hint: The Viterbi algorithm uses dynamic programming to find the most probable sequence of hidden states.",
  "Hint: For each word, calculate the probability for each POS using emission and transition matrices.",
  "Hint: The value in each cell is the max probability of any path ending in that POS at this word.",
  "Hint: Use the previous column's max values and the transition matrix to compute the current column.",
];

let userAnswers = [];
let currentCorpus = null;
let currentCorpusKey = null;
let currentTurn = 1;

// Add a flag to indicate if the simulation is complete
let simulationComplete = false;

function renderSimulation(corpus) {
  userAnswers = [];
  currentCorpus = corpus;
  currentTurn = 1;
  let html = "";

  // Add section title with test sentence and info icon
  html +=
    '<div class="sim-section-title">Test sentence: ' +
    corpus.sentence +
    '<button class="info-icon" onclick="showTestSentenceInfo()" aria-label="Why this test sentence?" title="Why this test sentence?">' +
    '<i class="fas fa-info-circle"></i>' +
    "</button>" +
    "</div>";

  // Remove the separate test sentence header since it's now in the section title

  // Step indicator and table containers
  html += '<div id="sim-step-indicator" class="sim-step-indicator"></div>';
  html +=
    '<div class="viterbi-table-container"><div id="viterbi-table-div"></div></div>';
  html += '<div class="viterbi-controls" id="viterbi-controls"></div>';

  $("#fldiv").html(html);
  renderViterbiTableAndControls(corpus);

  // Sync instructions panel width after rendering
  setTimeout(syncInstructionsPanelWidth, 50);
}

function renderMatrixTable(matrix, rowLabels, colLabels) {
  let html = '<table class="viterbi-table"><tr><th></th>';
  colLabels.forEach(
    (label) => (html += "<th>" + capitalizeFirstLetter(label) + "</th>")
  );
  html += "</tr>";
  for (let i = 0; i < rowLabels.length; i++) {
    html += "<tr><th>" + capitalizeFirstLetter(rowLabels[i]) + "</th>";
    for (let j = 0; j < colLabels.length; j++) {
      let val = matrix[i][j];
      html += "<td>" + (!Number.isFinite(Number(val)) ? "N/A" : val) + "</td>";
    }
    html += "</tr>";
  }
  html += "</table>";
  return html;
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderViterbiTable(corpus, userInput = []) {
  const words = corpus.sentence.split(/\s+/);
  let html = '<table class="viterbi-table" id="viterbiDecoding"><tr><th></th>';
  words.forEach((w) => (html += "<th>" + w + "</th>"));
  html += "</tr>";
  for (let i = 0; i < corpus.pos.length; i++) {
    html += "<tr><th>" + capitalizeFirstLetter(corpus.pos[i]) + "</th>";
    for (let j = 0; j < words.length; j++) {
      let val =
        userInput[j] && userInput[j][i] !== undefined ? userInput[j][i] : "";
      let correctVal = corpus.viterbi[i][j];
      if (simulationComplete) {
        html +=
          "<td>" +
          (!Number.isFinite(Number(correctVal)) ? "N/A" : correctVal) +
          "</td>";
      } else if (!Number.isFinite(Number(correctVal))) {
        html +=
          '<td><input type="text" class="viterbi-input" data-row="' +
          i +
          '" data-col="' +
          j +
          '" value="" placeholder="N/A" disabled title="No data available for this cell" /></td>';
      } else {
        html +=
          '<td><input type="text" class="viterbi-input" data-row="' +
          i +
          '" data-col="' +
          j +
          '" value="' +
          (val === undefined || val === null || isNaN(val) ? "" : val) +
          '" /></td>';
      }
    }
    html += "</tr>";
  }
  html += "</table>";
  return html;
}

function renderViterbiTableAndControls(corpus, userInput) {
  const words = corpus.sentence.split(/\s+/);
  if (!userInput) {
    userInput = Array(words.length)
      .fill()
      .map(() => Array(corpus.pos.length).fill(""));
  }
  $("#viterbi-table-div").html(renderViterbiTable(corpus, userInput));
  setupViterbiControls(corpus, userInput);
}

function setupViterbiControls(corpus, userInput) {
  const words = corpus.sentence.split(/\s+/);
  let controls = "";
  let feedback = "";
  const isLastStep = simulationComplete;
  let checkDisabled = false;
  let showAnswerDisabled = false;
  let showHintDisabled = false;
  if (isLastStep) {
    showAnswerDisabled = true;
    showHintDisabled = true;
  }
  controls +=
    '<button id="viterbi-check-btn" class="sim-button" aria-label="Check your answer"' +
    (isLastStep ? " disabled" : "") +
    ">Check</button>";
  controls += ' <span id="get-hide-answer">';
  controls +=
    '<button id="show-answer-btn" class="sim-button" aria-label="Show the answer for this step"' +
    (showAnswerDisabled ? " disabled" : "") +
    ">Show Answer</button>";
  controls += "</span>";
  controls +=
    ' <button id="show-hint-btn" class="sim-button" aria-label="Show a hint for this step"' +
    (showHintDisabled ? " disabled" : "") +
    ">Show Hint</button>";
  controls +=
    ' <button id="restart-btn" class="sim-button" aria-label="Restart simulation">Reset</button>';

  // Separate button row from feedback area
  $("#viterbi-controls").html(
    '<div class="viterbi-buttons-row">' +
      controls +
      "</div>" +
      '<div id="viterbi-feedback" class="feedback-message" style="display:none;"></div>' +
      '<div id="sim-hint" style="display:none;"></div>'
  );
  // Show Answer button
  if (!showAnswerDisabled) {
    $(document)
      .off("click", "#show-answer-btn")
      .on("click", "#show-answer-btn", function () {
        // Hide hints when showing answer
        $("#sim-hint").hide().empty();

        showViterbiAnswer(corpus, userInput);
      });
  } else {
    $(document).off("click", "#show-answer-btn");
  }
  // Show Hint button
  if (!showHintDisabled) {
    $(document)
      .off("click", "#show-hint-btn")
      .on("click", "#show-hint-btn", function () {
        // Hide answer table when showing hints
        $("#viterbi-feedback").hide().empty();

        let allHints = viterbiHints
          .map((h) => '<div class="sim-hint" tabindex="0">' + h + "</div>")
          .join("");
        $("#sim-hint").html(allHints).show();
        $(this).attr("aria-pressed", "true");
      });
  } else {
    $(document).off("click", "#show-hint-btn");
  }
  // Reset button
  $(document)
    .off("click", "#restart-btn")
    .on("click", "#restart-btn", function () {
      simulationComplete = false;
      $("#viterbi-feedback").hide();
      $("#sim-hint").hide().empty();
      // Always reset to Corpus A (corpus1)
      $("#corpus-select").val("corpus1").trigger("change");
    });
  // Keyboard navigation for input fields (column-wise tabbing)
  const $inputs = $(".viterbi-input");
  $inputs.each(function (idx, el) {
    $(el).attr(
      "aria-label",
      "Input for " +
        corpus.pos[$(el).data("row")] +
        ", word " +
        (parseInt($(el).data("col")) + 1)
    );
    $(el).on("keydown", function (e) {
      if (e.key === "Enter") {
        $("#viterbi-check-btn").focus().click();
      } else if (e.key === "Tab") {
        // Custom tab order: column by column
        e.preventDefault();
        const row = $(this).data("row");
        const col = $(this).data("col");
        let nextRow = (row + 1) % corpus.pos.length;
        let nextCol = col;
        if (nextRow === 0) {
          nextCol = col + 1;
        }
        // Find the next input
        const $next = $(
          ".viterbi-input[data-row=" + nextRow + "][data-col=" + nextCol + "]"
        );
        if ($next.length) {
          $next.focus();
        }
      }
    });
  });
  // Check button handler
  if (!isLastStep) {
    $("#viterbi-check-btn")
      .off("click")
      .on("click", function () {
        // Collect all user input for all columns
        let userVals = Array(words.length)
          .fill()
          .map(() => Array(corpus.pos.length).fill(""));
        let valid = true;
        $(".viterbi-input").each(function () {
          let row = $(this).data("row");
          let col = $(this).data("col");
          if ($(this).is(":disabled")) {
            userVals[col][row] = "N/A";
            return;
          }
          let val = $(this).val().trim();
          if (val === "" || isNaN(parseFloat(val))) valid = false;
          userVals[col][row] = val;
        });
        if (!valid) {
          $("#viterbi-feedback")
            .removeClass()
            .addClass("feedback-message feedback-error")
            .html("Please enter valid numbers for all fields.")
            .show();
          return;
        }
        // Compare with correct answers
        let correct = true;
        for (let j = 0; j < words.length; j++) {
          for (let i = 0; i < corpus.pos.length; i++) {
            if (userVals[j][i] === "N/A") continue;
            let userVal = parseFloat(userVals[j][i]);
            let correctVal = parseFloat(corpus.viterbi[i][j]);
            if (Math.abs(userVal - correctVal) > 0.001) correct = false;
          }
        }
        userAnswers = userVals.map((arr) => arr.slice());
        if (correct) {
          $("#sim-hint").html("");
          simulationComplete = true;
          // Don't re-render the viterbi table - keep its original styling
          // Show success message first
          $("#viterbi-feedback")
            .removeClass()
            .addClass("feedback-message feedback-success")
            .html(
              "All steps correct! POS tags for Decoded Sentence shown below."
            )
            .show();
          // Then show POS tags table below the message
          showPOS(corpus);
          $("#show-answer-btn, #show-hint-btn")
            .prop("disabled", true)
            .css({ opacity: 0.5, cursor: "not-allowed" });
          $("#viterbi-check-btn").show();
          $("#restart-btn").show();
          $(document).off("click", "#show-answer-btn");
          $(document).off("click", "#show-hint-btn");
        } else {
          $("#viterbi-feedback")
            .removeClass()
            .addClass("feedback-message feedback-error")
            .html("Wrong Answer! Try again.")
            .show();
          $("#sim-hint").html("");
        }
      });
  } else {
    $("#viterbi-check-btn")
      .prop("disabled", true)
      .css({ opacity: 0.5, cursor: "not-allowed" });
  }
}

function showPOS(corpus) {
  simulationComplete = true;
  // Don't re-render the viterbi table - keep its original styling
  // Show the POS tags for the decoded sentence in the feedback area with proper styling
  let posSection =
    '<div class="pos-tags-section">' +
    '<div class="sim-section-title">POS tags for Decoded Sentence</div>' +
    '<table class="pos-tags-table"><tr>';
  // Show the test sentence words as the heading
  const words = corpus.sentence.split(/\s+/);
  words.forEach((w) => {
    posSection += "<th>" + w + "</th>";
  });
  posSection += "</tr><tr>";
  corpus.sentencePos.forEach((tag) => {
    posSection +=
      '<td class="sim-pos-tag">' + capitalizeFirstLetter(tag) + "</td>";
  });
  posSection += "</tr></table></div>";
  // Append to feedback area instead of viterbi table div
  $("#viterbi-feedback").append(posSection);
  // Disable the Check button after completion
  $("#viterbi-check-btn")
    .prop("disabled", true)
    .css({ opacity: 0.5, cursor: "not-allowed" });
}

function showViterbiAnswer(corpus, userInput) {
  const words = corpus.sentence.split(/\s+/);
  const pos = corpus.pos;
  const viterbi = corpus.viterbi;
  // Always use userAnswers for user input values
  userInput = userAnswers && userAnswers.length ? userAnswers : userInput;
  // Check if all user input cells are empty
  let allEmpty = true;
  for (let j = 0; j < words.length; j++) {
    for (let i = 0; i < pos.length; i++) {
      let val =
        userInput && userInput[j] && userInput[j][i] !== undefined
          ? userInput[j][i]
          : "";
      if (val && val.trim() !== "") {
        allEmpty = false;
        break;
      }
    }
    if (!allEmpty) break;
  }
  if (allEmpty) {
    $("#viterbi-feedback")
      .html(
        '<span style="color:red;font-weight:bold;">Please enter your answers in the table before viewing the answer comparison.</span>'
      )
      .show();
    return;
  }
  let html = "";
  html +=
    '<table class="viterbi-table" style="max-width:600px;margin:auto;background:white;border-collapse:collapse;">';
  html +=
    "<tr><th style='background:#f5f5f5;padding:8px;border:1px solid #ddd;'>POS \\ Word</th>";
  words.forEach(
    (w) =>
      (html +=
        "<th style='background:#f5f5f5;padding:8px;border:1px solid #ddd;'>" +
        w +
        "</th>")
  );
  html += "</tr>";
  for (let i = 0; i < pos.length; i++) {
    html +=
      "<tr><th style='background:#f5f5f5;padding:8px;border:1px solid #ddd;'>" +
      pos[i] +
      "</th>";
    for (let j = 0; j < words.length; j++) {
      let userVal =
        userInput && userInput[j] && userInput[j][i] !== undefined
          ? userInput[j][i]
          : "";
      let correctVal = viterbi[i][j];
      let isCorrect = parseFloat(userVal) === correctVal;
      let userDisplay = "";
      if (userVal === undefined || userVal === null || userVal === "") {
        userDisplay = "";
      } else if (isNaN(parseFloat(userVal))) {
        userDisplay = "Invalid";
      } else {
        userDisplay = userVal;
      }
      let correctDisplay = !Number.isFinite(Number(correctVal))
        ? "N/A"
        : correctVal;
      html +=
        "<td style='padding:8px;border:1px solid #ddd;text-align:center;'>";
      if (userDisplay === "Invalid") {
        html +=
          '<span style="color:#d32f2f;font-weight:bold;">Invalid</span> <span style="color:#388e3c;font-weight:bold;">(' +
          correctDisplay +
          ")</span>";
      } else if (isCorrect) {
        html +=
          '<span style="color:#388e3c;font-weight:bold;">' +
          userDisplay +
          " / " +
          correctDisplay +
          "</span>";
      } else {
        html +=
          '<span style="color:#d32f2f;font-weight:bold;">' +
          userDisplay +
          '</span> <span style="color:#388e3c;font-weight:bold;">(' +
          correctDisplay +
          ")</span>";
      }
      html += "</td>";
    }
    html += "</tr>";
  }
  html += "</table>";
  html +=
    '<div style="font-size:0.9em;margin-top:12px;text-align:center;color:#666;">Legend: <span style="color:#388e3c;font-weight:bold;">Green</span> = Correct, <span style="color:#d32f2f;font-weight:bold;">Red</span> = Incorrect, <b>N/A</b> = Not Available in data</div>';
  $("#viterbi-feedback").html(html).show();
}

// Matrix toggle functionality
// Legacy function - no longer needed with tabbed interface
function setupMatrixToggles() {
  // This function is kept for compatibility but does nothing
  // The new tabbed interface is handled by setupMatrixTabs()
}

// Enhanced matrix rendering for collapsible sections
function renderCollapsibleMatrices(corpusObj) {
  // Render emission matrix
  const emissionHTML = renderMatrixTable(
    corpusObj.emission,
    corpusObj.pos,
    corpusObj.words
  );

  // Render transition matrix
  const transitionHTML = renderMatrixTable(
    corpusObj.transition,
    corpusObj.pos,
    corpusObj.pos
  );

  // Create the tabbed interface structure
  const matricesHTML = `
    <div class="matrices-headers">
      <div class="matrix-title active" data-matrix="emission">
        <i class="fas fa-table"></i>Emission Matrix
      </div>
      <div class="matrix-title" data-matrix="transition">
        <i class="fas fa-exchange-alt"></i>Transition Matrix
      </div>
    </div>
    <div class="matrix-content-area">
      <div id="emission-matrix-display" class="matrix-table-display active">
        ${emissionHTML}
      </div>
      <div id="transition-matrix-display" class="matrix-table-display">
        ${transitionHTML}
      </div>
    </div>
  `;

  // Update the matrices section
  document.getElementById("emission-matrix-container").innerHTML = matricesHTML;

  // Clear the transition matrix container since we're using a single tabbed interface
  document.getElementById("transition-matrix-container").innerHTML = "";

  // Keep legacy matrices-pane for compatibility but hide it
  $("#matrices-pane").html(
    '<div class="sim-section-title">Emission Matrix</div>' +
      emissionHTML +
      '<div class="sim-section-title" style="margin-top:18px;">Transition Matrix</div>' +
      transitionHTML
  );

  // Setup the matrix tab functionality
  setupMatrixTabs();
}

// Setup matrix tab functionality
function setupMatrixTabs() {
  // Remove any existing event listeners
  $(document).off("click", ".matrix-title");

  // Add click handler for matrix tabs
  $(document).on("click", ".matrix-title", function () {
    const matrixType = $(this).data("matrix");

    // Remove active class from all tabs
    $(".matrix-title").removeClass("active");

    // Add active class to clicked tab
    $(this).addClass("active");

    // Hide all matrix displays
    $(".matrix-table-display").removeClass("active");

    // Show the selected matrix display
    $(`#${matrixType}-matrix-display`).addClass("active");
  });
}

// Initialize matrix tab functionality
$(document).ready(function () {
  // The setupMatrixTabs function will be called after renderCollapsibleMatrices
  // No need for additional initialization here since the function handles everything
});
