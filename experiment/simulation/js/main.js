//Your JavaScript goes in here

// Load corpora.json and populate dropdown
$(document).ready(function() {
    $.getJSON('data/corpora.json', function(corpora) {
        // Remove sim-button from select, use default styling
        var $select = $('<select name="option" id="corpus-select" style="min-width:180px;max-width:100%;"></select>');
        $select.append('<option value="">---Select Corpus---</option>');
        corpora.forEach(function(corpus, idx) {
            $select.append('<option value="' + corpus.filename + '">' + corpus.label + '</option>');
        });
        // Wrap in a div with simulation-step class for styling
        $('#corpus').html('<div class="simulation-step">Corpus Selection:<br/></div>');
        $('#corpus .simulation-step').append($select);
        $('#full-sentence').html('');
        $('#fldiv').html('');
        $('#matrices-pane').html('');

        // Select Corpus A by default and trigger change
        setTimeout(function() {
            $select.val('corpus1').trigger('change');
        }, 0);

        $select.on('change', function() {
            const selected = $(this).val();
            if (!selected) {
                $('#full-sentence').html('');
                $('#fldiv').html('');
                $('#matrices-pane').html('');
                return;
            }
            // Reset all state
            userAnswers = [];
            simulationComplete = false;
            currentTurn = 1;
            // Load and render the new corpus (restore original logic)
            $.ajax({
                url: 'data/' + selected,
                dataType: 'text',
                success: function(data) {
                    const corpusObj = parseCorpus(data);
                    // Render full sentence in left pane
                    $('#full-sentence').html('<div class="sim-section-title" style="margin-bottom:8px;">Full Sentence:</div>' +
                        '<div class="sim-sentence" style="margin-bottom:18px;">' + corpusObj.fullSentence + '</div>');
                    // Render matrices in right pane
                    $('#matrices-pane').html(
                        '<div class="sim-section-title">Emission Matrix</div>' +
                        renderMatrixTable(corpusObj.emission, corpusObj.pos, corpusObj.words) +
                        '<div class="sim-section-title" style="margin-top:18px;">Transition Matrix</div>' +
                        renderMatrixTable(corpusObj.transition, corpusObj.pos, corpusObj.pos)
                    );
                    // Render simulation in middle pane
                    renderSimulation(corpusObj);
                },
                error: function() {
                    $('#full-sentence').html('');
                    $('#fldiv').html('<p style="color:red;">Failed to load corpus file.</p>');
                    $('#matrices-pane').html('');
                }
            });
        });
    });
});

function parseCorpus(data) {
    // Split by lines and remove empty lines
    const lines = data.split(/\r?\n/).filter(line => line.trim() !== '');
    let idx = 0;
    const result = {};
    // 1. Full sentence
    if (!lines[idx]) throw new Error('Corpus file missing full sentence at line 1');
    result.fullSentence = lines[idx++];
    // 2. Words
    if (!lines[idx]) throw new Error('Corpus file missing words at line 2');
    result.words = lines[idx++].split(/\s+/);
    // 3. POS tags
    if (!lines[idx]) throw new Error('Corpus file missing POS tags at line 3');
    result.pos = lines[idx++].split(/\s+/);
    // 4. Emission matrix (POS x Words)
    result.emission = [];
    for (let i = 0; i < result.pos.length; i++) {
        if (!lines[idx]) throw new Error('Corpus file missing emission matrix row at line ' + (idx+1));
        result.emission.push(lines[idx++].split(/\s+/).map(Number));
    }
    // 5. Transition matrix (POS x POS)
    result.transition = [];
    for (let i = 0; i < result.pos.length; i++) {
        if (!lines[idx]) throw new Error('Corpus file missing transition matrix row at line ' + (idx+1));
        result.transition.push(lines[idx++].split(/\s+/).map(Number));
    }
    // 6. Sentence to decode
    if (!lines[idx]) throw new Error('Corpus file missing sentence to decode at line ' + (idx+1));
    result.sentence = lines[idx++];
    // 7. Viterbi matrix (POS x Words in sentence)
    const sentenceWords = result.sentence.split(/\s+/);
    result.viterbi = [];
    for (let i = 0; i < result.pos.length; i++) {
        if (!lines[idx]) throw new Error('Corpus file missing viterbi matrix row at line ' + (idx+1));
        result.viterbi.push(lines[idx++].split(/\s+/).map(Number));
    }
    // 8. POS for sentence
    if (!lines[idx]) throw new Error('Corpus file missing POS for sentence at line ' + (idx+1));
    result.sentencePos = lines[idx++].split(/\s+/);
    return result;
}

// Inject modern pure CSS styles for the simulation UI
(function() {
    const style = document.createElement('style');
    style.innerHTML = `
    .sim-card { background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; margin: 20px auto; padding: 24px 32px; max-width: 900px; }
    @media (max-width: 600px) {
      .sim-card { padding: 10px 2vw; max-width: 98vw; }
      .sim-table th, .sim-table td { padding: 4px 2px; font-size: 0.95em; }
      .sim-sentence { font-size: 1em; }
    }
    .sim-progress-bar-bg { width: 100%; background: #eee; border-radius: 6px; height: 18px; margin-bottom: 12px; position: relative; overflow: hidden; }
    .sim-progress-bar { height: 100%; background: #0074d9; border-radius: 6px; transition: width 0.3s; position: absolute; left: 0; top: 0; }
    .sim-btn { background: #0074d9; color: #fff; border: none; border-radius: 4px; padding: 6px 18px; margin: 0 6px; font-size: 1em; cursor: pointer; transition: background 0.2s; }
    .sim-btn:focus { outline: 2px solid #005fa3; }
    .sim-btn[aria-pressed="true"] { background: #005fa3; }
    .sim-hint { background: #f6faff; border-left: 4px solid #0074d9; padding: 8px 12px; margin: 10px 0; border-radius: 4px; font-size: 1em; }
    .sim-section-title { font-size: 1.3em; font-weight: bold; margin-bottom: 10px; }
    .sim-toggle { background: #f5f5f5; border: none; color: #0074d9; cursor: pointer; margin-bottom: 10px; font-size: 1em; }
    .sim-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .sim-table th, .sim-table td { border: 1px solid #bbb; padding: 6px 10px; text-align: center; font-style: normal; }
    .sim-table th { background: #f0f0f0; }
    .sim-step-indicator { font-size: 1.1em; margin-bottom: 10px; color: #333; }
    .sim-feedback { margin-top: 10px; min-height: 24px; font-size: 1.1em; }
    .sim-sentence { font-size: 1.15em; background: #f9f9f9; padding: 8px 12px; border-radius: 4px; margin-bottom: 12px; display: inline-block; }
    .sim-pos-tag { color: #008800; font-style: normal; }
    .sim-collapsible { display: none; }
    .sim-collapsible.open { display: block; }
    .sim-info-icon {
      display: inline-block;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #0074d9;
      color: #fff;
      text-align: center;
      font-weight: bold;
      font-size: 1em;
      line-height: 20px;
      margin-left: 8px;
      cursor: pointer;
      position: relative;
    }
    .sim-info-icon:focus {
      outline: 2px solid #005fa3;
    }
    .sim-info-tooltip {
      visibility: hidden;
      opacity: 0;
      background: #222;
      color: #fff;
      text-align: center;
      border-radius: 4px;
      padding: 4px 10px;
      position: absolute;
      z-index: 10;
      left: 110%;
      top: 50%;
      transform: translateY(-50%);
      white-space: nowrap;
      font-size: 0.95em;
      transition: opacity 0.2s;
      pointer-events: none;
    }
    .sim-info-icon:hover .sim-info-tooltip, .sim-info-icon:focus .sim-info-tooltip {
      visibility: visible;
      opacity: 1;
      pointer-events: auto;
    }
    .sim-info-modal-bg {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0; top: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.25);
      align-items: center;
      justify-content: center;
    }
    .sim-info-modal {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 16px #0003;
      max-width: 500px;
      padding: 24px 28px;
      margin: 40px auto;
      font-size: 1.05em;
      position: relative;
    }
    .sim-info-modal-close {
      position: absolute;
      top: 8px;
      right: 12px;
      font-size: 1.3em;
      color: #0074d9;
      background: none;
      border: none;
      cursor: pointer;
    }
    `;
    document.head.appendChild(style);
})();

// Hints for each step (can be expanded)
const viterbiHints = [
    'Hint: The Viterbi algorithm uses dynamic programming to find the most probable sequence of hidden states.',
    'Hint: For each word, calculate the probability for each POS using emission and transition matrices.',
    'Hint: The value in each cell is the max probability of any path ending in that POS at this word.',
    'Hint: Use the previous column\'s max values and the transition matrix to compute the current column.'
];

let userAnswers = [];
let currentCorpus = null;
let currentTurn = 1;

// Add a flag to indicate if the simulation is complete
let simulationComplete = false;

function renderSimulation(corpus) {
    userAnswers = [];
    currentCorpus = corpus;
    currentTurn = 1;
    let html = '';
    // Test Sentence with info icon
    html += '<div class="sim-sentence"><b>Test Sentence:</b> ' + corpus.sentence +
      ' <span class="sim-info-icon" tabindex="0" aria-label="Why this Test Sentence?" role="button">i'
      + '<span class="sim-info-tooltip">Why this Test Sentence?</span>'
      + '</span></div>';
    html += '<div id="sim-info-modal-bg" class="sim-info-modal-bg"><div class="sim-info-modal" tabindex="0">'
      + '<button class="sim-info-modal-close sim-button" aria-label="Close info">&times;</button>'
      + '<div class="sim-section-title" style="margin-top:0;">Why this Test Sentence?</div>'
      + '<div class="sim-hint" style="margin-bottom:10px; background: #f6faff; border-left: 4px solid #0074d9;">'
      + 'The simulation uses two different sentences for two distinct purposes, which is a common practice in natural language processing tasks. <br><br>'
      + '<b>The Training Corpus:</b> The longer sentence, <i>' + corpus.fullSentence + '</i>, serves as the training data. The simulation analyzes this text to calculate the Transition Probabilities (the likelihood of one part-of-speech tag following another) and Emission Probabilities (the likelihood of a word corresponding to a specific tag). You see these probabilities in the two matrices at the top of the simulation.<br><br>'
      + '<b>The Test Sentence:</b> The shorter sentence, <i>' + corpus.sentence + '</i>, is the test sentence. Your task in the simulation is to apply the Viterbi algorithm to this sentence, using the probabilities derived from the larger training corpus. The goal is to find the most likely sequence of part-of-speech tags for "' + corpus.sentence + '".<br><br>'
      + 'In short, the long sentence isn\'t being converted into the short one. Rather, the long sentence is used to build the statistical model, and the short sentence is the specific problem you need to solve using that model. This mimics a real-world scenario where you would train a model on a large amount of text and then use it to analyze new, unseen sentences.'
      + '</div></div></div>';
    html += '<div id="sim-step-indicator" class="sim-step-indicator"></div>';
    html += '<div id="viterbi-table-div"></div>';
    html += '<div id="viterbi-controls"></div>';
    $('#fldiv').html(html);
    // Info icon handlers
    $('.sim-info-icon').on('click keydown', function(e) {
      if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
        $('#sim-info-modal-bg').fadeIn(120);
        $('.sim-info-modal').focus();
      }
    });
    $('.sim-info-modal-close, #sim-info-modal-bg').on('click keydown', function(e) {
      if (e.type === 'click' || e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        $('#sim-info-modal-bg').fadeOut(120);
        $('.sim-info-icon').focus();
      }
    });
    // Prevent modal click from closing if clicking inside
    $('.sim-info-modal').on('click', function(e) { e.stopPropagation(); });
    renderViterbiTableAndControls(corpus);
}

function renderMatrixTable(matrix, rowLabels, colLabels) {
    let html = '<table class="sim-table"><tr><th></th>';
    colLabels.forEach(label => html += '<th>' + label + '</th>');
    html += '</tr>';
    for (let i = 0; i < rowLabels.length; i++) {
        html += '<tr><th>' + rowLabels[i] + '</th>';
        for (let j = 0; j < colLabels.length; j++) {
            let val = matrix[i][j];
            html += '<td>' + (!Number.isFinite(Number(val)) ? 'N/A' : val) + '</td>';
        }
        html += '</tr>';
    }
    html += '</table>';
    return html;
}

function renderViterbiTable(corpus, userInput = []) {
    const words = corpus.sentence.split(/\s+/);
    let html = '<table class="sim-table" id="viterbiDecoding"><tr><th></th>';
    words.forEach(w => html += '<th>' + w + '</th>');
    html += '</tr>';
    for (let i = 0; i < corpus.pos.length; i++) {
        html += '<tr><th>' + corpus.pos[i] + '</th>';
        for (let j = 0; j < words.length; j++) {
            let val = (userInput[j] && userInput[j][i] !== undefined) ? userInput[j][i] : '';
            let correctVal = corpus.viterbi[i][j];
            if (simulationComplete) {
                html += '<td>' + (!Number.isFinite(Number(correctVal)) ? 'N/A' : correctVal) + '</td>';
            } else if (!Number.isFinite(Number(correctVal))) {
                html += '<td><input type="text" class="viterbi-input" data-row="' + i + '" data-col="' + j + '" value="" placeholder="N/A" disabled title="No data available for this cell" style="width:60px;background:#f5f5f5;color:#888;" /></td>';
            } else {
                html += '<td><input type="text" class="viterbi-input" data-row="' + i + '" data-col="' + j + '" value="' + (val === undefined || val === null || isNaN(val) ? '' : val) + '" style="width:60px;" /></td>';
            }
        }
        html += '</tr>';
    }
    html += '</table>';
    return html;
}

function renderViterbiTableAndControls(corpus, userInput) {
    const words = corpus.sentence.split(/\s+/);
    if (!userInput) {
        userInput = Array(words.length).fill().map(() => Array(corpus.pos.length).fill(''));
    }
    $('#viterbi-table-div').html(renderViterbiTable(corpus, userInput));
    setupViterbiControls(corpus, userInput);
}

function setupViterbiControls(corpus, userInput) {
    const words = corpus.sentence.split(/\s+/);
    let controls = '';
    let feedback = '';
    const isLastStep = simulationComplete;
    let checkDisabled = false;
    let showAnswerDisabled = false;
    let showHintDisabled = false;
    if (isLastStep) {
        showAnswerDisabled = true;
        showHintDisabled = true;
    }
    controls += '<button id="viterbi-check-btn" class="sim-button" aria-label="Check your answer"' + (isLastStep ? ' disabled' : '') + '>Check</button>';
    controls += ' <span id="get-hide-answer">';
    controls += '<button id="show-answer-btn" class="sim-button" aria-label="Show the answer for this step"' + (showAnswerDisabled ? ' disabled' : '') + '>Show Answer</button>';
    controls += '</span>';
    controls += ' <button id="show-hint-btn" class="sim-button" aria-label="Show a hint for this step"' + (showHintDisabled ? ' disabled' : '') + '>Show Hint</button>';
    controls += ' <button id="restart-btn" class="sim-button" aria-label="Restart simulation">Reset</button>';
    $('#viterbi-controls').html(controls + '<div id="viterbi-feedback" class="sim-feedback">' + feedback + '</div><div id="sim-hint"></div>');
    // Show Answer button
    if (!showAnswerDisabled) {
        $(document).off('click', '#show-answer-btn').on('click', '#show-answer-btn', function() {
            showViterbiAnswer(corpus, userInput);
        });
    } else {
        $(document).off('click', '#show-answer-btn');
    }
    // Show Hint button
    if (!showHintDisabled) {
        $(document).off('click', '#show-hint-btn').on('click', '#show-hint-btn', function() {
            let allHints = viterbiHints.map(h => '<div class="sim-hint" tabindex="0">' + h + '</div>').join('');
            $('#sim-hint').html(allHints);
            $(this).attr('aria-pressed', 'true');
        });
    } else {
        $(document).off('click', '#show-hint-btn');
    }
    // Reset button
    $(document).off('click', '#restart-btn').on('click', '#restart-btn', function() {
        simulationComplete = false;
        // Always reset to Corpus A (corpus1)
        $('#corpus-select').val('corpus1').trigger('change');
    });
    // Keyboard navigation for input fields (column-wise tabbing)
    const $inputs = $('.viterbi-input');
    $inputs.each(function(idx, el) {
        $(el).attr('aria-label', 'Input for ' + corpus.pos[$(el).data('row')] + ', word ' + (parseInt($(el).data('col')) + 1));
        $(el).on('keydown', function(e) {
            if (e.key === 'Enter') {
                $('#viterbi-check-btn').focus().click();
            } else if (e.key === 'Tab') {
                // Custom tab order: column by column
                e.preventDefault();
                const row = $(this).data('row');
                const col = $(this).data('col');
                let nextRow = (row + 1) % corpus.pos.length;
                let nextCol = col;
                if (nextRow === 0) {
                    nextCol = col + 1;
                }
                // Find the next input
                const $next = $('.viterbi-input[data-row=' + nextRow + '][data-col=' + nextCol + ']');
                if ($next.length) {
                    $next.focus();
                }
            }
        });
    });
    // Check button handler
    if (!isLastStep) {
        $('#viterbi-check-btn').off('click').on('click', function() {
            // Collect all user input for all columns
            let userVals = Array(words.length).fill().map(() => Array(corpus.pos.length).fill(''));
            let valid = true;
            $('.viterbi-input').each(function() {
                let row = $(this).data('row');
                let col = $(this).data('col');
                if ($(this).is(':disabled')) {
                    userVals[col][row] = 'N/A';
                    return;
                }
                let val = $(this).val().trim();
                if (val === '' || isNaN(parseFloat(val))) valid = false;
                userVals[col][row] = val;
            });
            if (!valid) {
                $('#viterbi-feedback').html('<span style="color:red;">Please enter valid numbers for all fields.</span>');
                return;
            }
            // Compare with correct answers
            let correct = true;
            for (let j = 0; j < words.length; j++) {
                for (let i = 0; i < corpus.pos.length; i++) {
                    if (userVals[j][i] === 'N/A') continue;
                    let userVal = parseFloat(userVals[j][i]);
                    let correctVal = parseFloat(corpus.viterbi[i][j]);
                    if (Math.abs(userVal - correctVal) > 0.001) correct = false;
                }
            }
            userAnswers = userVals.map(arr => arr.slice());
            if (correct) {
                $('#sim-hint').html('');
                simulationComplete = true;
                $('#viterbi-table-div').html(renderViterbiTable(corpus, userVals));
                // Immediately show POS tags and final table (skip Check Part of Speech button)
                showPOS(corpus);
                $('#viterbi-feedback').html('<span style="color:green;">All steps correct! POS tags for Decoded Sentence shown below.</span>');
                $('#show-answer-btn, #show-hint-btn').prop('disabled', true).css({'opacity':0.5, 'cursor':'not-allowed'});
                $('#viterbi-check-btn').show();
                $('#restart-btn').show();
                $(document).off('click', '#show-answer-btn');
                $(document).off('click', '#show-hint-btn');
            } else {
                $('#viterbi-feedback').html('<span style="color:red;">Wrong Answer! Try again.</span>');
                $('#sim-hint').html('');
            }
        });
    } else {
        $('#viterbi-check-btn').prop('disabled', true).css({'opacity':0.5, 'cursor':'not-allowed'});
    }
}

function showPOS(corpus) {
    simulationComplete = true;
    // Re-render the viterbi table with all values as plain text (no inputs)
    $('#viterbi-table-div').html(renderViterbiTable(corpus, corpus.sentence.split(/\s+/).length + 1, Array(corpus.pos.length).fill('')));
    // Show the POS tags for the decoded sentence
    let posRow = '<div class="sim-section-title">POS tags for Decoded Sentence</div>';
    posRow += '<table class="sim-table"><tr>';
    // Show the test sentence words as the heading
    const words = corpus.sentence.split(/\s+/);
    words.forEach(w => {
        posRow += '<th>' + w + '</th>';
    });
    posRow += '</tr><tr>';
    corpus.sentencePos.forEach(tag => {
        posRow += '<td class="sim-pos-tag">' + tag + '</td>';
    });
    posRow += '</tr></table>';
    $('#viterbi-table-div').append(posRow);
    $('#viterbi-feedback').html('<span style="color:green;">Simulation complete!</span>');
    // Disable the Check button after completion
    $('#viterbi-check-btn').prop('disabled', true).css({'opacity':0.5, 'cursor':'not-allowed'});
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
            let val = (userInput && userInput[j] && userInput[j][i] !== undefined) ? userInput[j][i] : '';
            if (val && val.trim() !== '') {
                allEmpty = false;
                break;
            }
        }
        if (!allEmpty) break;
    }
    if (allEmpty) {
        $('#viterbi-feedback').html('<span style="color:red;">Please enter your answers in the table before viewing the answer comparison.</span>');
        return;
    }
    let html = '';
    html += '<table class="sim-table" style="max-width:600px;margin:auto;">';
    html += '<tr><th>POS \\ Word</th>';
    words.forEach(w => html += '<th>' + w + '</th>');
    html += '</tr>';
    for (let i = 0; i < pos.length; i++) {
        html += '<tr><th>' + pos[i] + '</th>';
        for (let j = 0; j < words.length; j++) {
            let userVal = (userInput && userInput[j] && userInput[j][i] !== undefined) ? userInput[j][i] : '';
            let correctVal = viterbi[i][j];
            let isCorrect = (parseFloat(userVal) === correctVal);
            let userDisplay = '';
            if (userVal === undefined || userVal === null || userVal === '') {
                userDisplay = '';
            } else if (isNaN(parseFloat(userVal))) {
                userDisplay = 'Invalid';
            } else {
                userDisplay = userVal;
            }
            let correctDisplay = (!Number.isFinite(Number(correctVal)) ? 'N/A' : correctVal);
            html += '<td>';
            if (userDisplay === 'Invalid') {
                html += '<span style="color:red;">Invalid</span> <span style="color:green;font-weight:bold;">(' + correctDisplay + ')</span>';
            } else if (isCorrect) {
                html += '<span style="color:green;font-weight:bold;">' + userDisplay + ' / ' + correctDisplay + '</span>';
            } else {
                html += '<span style="color:red;">' + userDisplay + '</span> <span style="color:green;font-weight:bold;">(' + correctDisplay + ')</span>';
            }
            html += '</td>';
        }
        html += '</tr>';
    }
    html += '</table>';
    html += '<div style="font-size:0.95em;margin-top:8px;color:#555;">Legend: <b>N/A</b> = Not Available in data, <b>Invalid</b> = Not a number</div>';
    $('#viterbi-feedback').html(html);
}
