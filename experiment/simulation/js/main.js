//Your JavaScript goes in here

// Load corpora.json and populate dropdown
$(document).ready(function() {
    $.getJSON('data/corpora.json', function(corpora) {
        var $select = $('<select name="option" id="corpus-select"><option value="">---Select Corpus---</option></select>');
        corpora.forEach(function(corpus, idx) {
            $select.append('<option value="' + corpus.filename + '">' + corpus.label + '</option>');
        });
        $('#corpus').html($select);
        $('#fldiv').html('');

        $select.on('change', function() {
            const selected = $(this).val();
            if (!selected) {
                $('#fldiv').html('');
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
                    renderSimulation(parseCorpus(data));
                },
                error: function() {
                    $('#fldiv').html('<p style="color:red;">Failed to load corpus file.</p>');
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
    let html = '<div class="sim-card">';
    // Show the full sentence at the top
    html += '<div class="sim-section-title" style="margin-bottom:8px;">Full Sentence:</div>';
    html += '<div class="sim-sentence" style="margin-bottom:18px;">' + corpus.fullSentence + '</div>';
    // Progress bar
    html += '<div class="sim-progress-bar-bg" aria-label="Progress"><div id="sim-progress-bar" class="sim-progress-bar" style="width:0%"></div></div>';
    // Collapsible Emission Matrix
    html += '<div><button class="sim-toggle sim-btn" id="toggle-emission" aria-expanded="false">Show Emission Matrix</button>';
    html += '<div id="emission-matrix" class="sim-collapsible" aria-hidden="true">' + renderMatrixTable(corpus.emission, corpus.pos, corpus.words) + '</div></div>';
    // Collapsible Transition Matrix
    html += '<div><button class="sim-toggle sim-btn" id="toggle-transition" aria-expanded="false">Show Transition Matrix</button>';
    html += '<div id="transition-matrix" class="sim-collapsible" aria-hidden="true">' + renderMatrixTable(corpus.transition, corpus.pos, corpus.pos) + '</div></div>';
    // Sentence to decode
    html += '<div class="sim-section-title" style="margin-top:18px;">Viterbi Decoding</div>';
    html += '<div class="sim-sentence"><b>Sentence:</b> ' + corpus.sentence + '</div>';
    // Step indicator
    html += '<div id="sim-step-indicator" class="sim-step-indicator"></div>';
    // Viterbi Table
    html += '<div id="viterbi-table-div"></div>';
    // Controls & Feedback
    html += '<div id="viterbi-controls"></div>';
    html += '</div>';
    $('#fldiv').html(html);
    // Collapsible logic
    $('#toggle-emission').on('click', function() {
        const $mat = $('#emission-matrix');
        $mat.toggleClass('open');
        const open = $mat.hasClass('open');
        $(this).text(open ? 'Hide Emission Matrix' : 'Show Emission Matrix').attr('aria-expanded', open);
        $mat.attr('aria-hidden', !open);
    });
    $('#toggle-transition').on('click', function() {
        const $mat = $('#transition-matrix');
        $mat.toggleClass('open');
        const open = $mat.hasClass('open');
        $(this).text(open ? 'Hide Transition Matrix' : 'Show Transition Matrix').attr('aria-expanded', open);
        $mat.attr('aria-hidden', !open);
    });
    // Start at step 1
    renderViterbiStep(corpus, 1, Array(corpus.pos.length).fill(''));
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

function renderViterbiStep(corpus, turn, userInput) {
    const words = corpus.sentence.split(/\s+/);
    currentTurn = turn;
    // Progress bar: fill from left to right
    let progress = 0;
    if (turn > words.length) {
        progress = 100;
    } else {
        progress = Math.round((turn - 1) / words.length * 100);
    }
    $('#sim-progress-bar').css({width: progress + '%'});
    // Step indicator
    $('#sim-step-indicator').text('Step ' + (turn > words.length ? words.length : turn) + ' of ' + words.length);
    // Viterbi Table
    $('#viterbi-table-div').html(renderViterbiTable(corpus, turn, userInput));
    // Controls & Feedback
    setupViterbiControls(corpus, turn, userInput);
}

function renderViterbiTable(corpus, turn = 1, userInput = []) {
    const words = corpus.sentence.split(/\s+/);
    let html = '<table class="sim-table" id="viterbiDecoding"><tr><th></th>';
    words.forEach(w => html += '<th>' + w + '</th>');
    html += '</tr>';
    for (let i = 0; i < corpus.pos.length; i++) {
        html += '<tr><th>' + corpus.pos[i] + '</th>';
        for (let j = 0; j < words.length; j++) {
            if (simulationComplete || j + 1 < turn) {
                let val = corpus.viterbi[i][j];
                html += '<td>' + (!Number.isFinite(Number(val)) ? 'N/A' : val) + '</td>';
            } else if (j + 1 === turn) {
                let val = userInput[i];
                let correctVal = corpus.viterbi[i][j];
                if (!Number.isFinite(Number(correctVal))) {
                    html += '<td><input type="text" class="viterbi-input" data-row="' + i + '" data-col="' + j + '" value="" placeholder="N/A" disabled title="No data available for this cell" style="width:60px;background:#f5f5f5;color:#888;" /></td>';
                } else {
                    html += '<td><input type="text" class="viterbi-input" data-row="' + i + '" data-col="' + j + '" value="' + (val === undefined || val === null || isNaN(val) ? '' : val) + '" style="width:60px;" /></td>';
                }
            } else {
                html += '<td>&nbsp;</td>';
            }
        }
        html += '</tr>';
    }
    html += '</table>';
    return html;
}

function setupViterbiControls(corpus, turn, userInput) {
    const words = corpus.sentence.split(/\s+/);
    let controls = '';
    let feedback = '';
    // Determine if we are at the last step (showing 'Check Part of Speech')
    const isLastStep = simulationComplete || turn > words.length;
    // Button states
    let checkDisabled = false;
    let showAnswerDisabled = false;
    let showHintDisabled = false;
    if (isLastStep) {
        // After 'Check Part of Speech' is visible, only Check and Reset are enabled
        showAnswerDisabled = true;
        showHintDisabled = true;
    }
    // Controls
    controls += '<button id="viterbi-check-btn" class="sim-btn" aria-label="Check your answer"' + (isLastStep ? ' disabled style="opacity:0.5;cursor:not-allowed;"' : '') + '>Check</button>';
    controls += ' <span id="get-hide-answer">';
    controls += '<button id="show-answer-btn" class="sim-btn" aria-label="Show the answer for this step"' + (showAnswerDisabled ? ' disabled style="opacity:0.5;cursor:not-allowed;"' : '') + '>Show Answer</button>';
    controls += '</span>';
    controls += ' <button id="show-hint-btn" class="sim-btn" aria-label="Show a hint for this step"' + (showHintDisabled ? ' disabled style="opacity:0.5;cursor:not-allowed;"' : '') + '>Show Hint</button>';
    controls += ' <button id="restart-btn" class="sim-btn" aria-label="Restart simulation">Reset</button>';
    $('#viterbi-controls').html(controls + '<div id="viterbi-feedback" class="sim-feedback">' + feedback + '</div><div id="sim-hint"></div>');
    // Disable/enable logic for answer/hint
    if (!showAnswerDisabled) {
        $(document).off('click', '#show-answer-btn').on('click', '#show-answer-btn', function() {
            showViterbiAnswer(corpus, turn);
        });
    } else {
        $(document).off('click', '#show-answer-btn');
    }
    if (!showHintDisabled) {
        $(document).off('click', '#show-hint-btn').on('click', '#show-hint-btn', function() {
            const hint = viterbiHints[(turn - 1) % viterbiHints.length];
            $('#sim-hint').html('<div class="sim-hint" tabindex="0">' + hint + '</div>');
            $(this).attr('aria-pressed', 'true');
        });
    } else {
        $(document).off('click', '#show-hint-btn');
    }
    // Reset button
    $(document).off('click', '#restart-btn').on('click', '#restart-btn', function() {
        // Clear the simulation display area
        $('#fldiv').html('');
        simulationComplete = false;
    });
    // Keyboard navigation for input fields
    $('.viterbi-input').each(function(idx, el) {
        $(el).attr('aria-label', 'Input for ' + corpus.pos[$(el).data('row')] + ', word ' + (parseInt($(el).data('col')) + 1));
        $(el).on('keydown', function(e) {
            if (e.key === 'Enter') {
                $('#viterbi-check-btn').focus().click();
            }
        });
    });
    // Button handler
    if (!isLastStep) {
        $('#viterbi-check-btn').off('click').on('click', function() {
            // Collect user input for this column
            let userVals = [];
            let valid = true;
            $('.viterbi-input').each(function() {
                if ($(this).is(':disabled')) {
                    userVals.push('N/A');
                    return; // skip validation for disabled inputs
                }
                let val = $(this).val().trim();
                if (val === '' || isNaN(parseFloat(val))) valid = false;
                userVals.push(val);
            });
            if (!valid) {
                $('#viterbi-feedback').html('<span style="color:red;">Please enter valid numbers for all fields.</span>');
                return;
            }
            // Compare with correct answers
            let correct = true;
            for (let i = 0; i < corpus.pos.length; i++) {
                if (userVals[i] === 'N/A') continue;
                let userVal = parseFloat(userVals[i]);
                let correctVal = parseFloat(corpus.viterbi[i][turn - 1]);
                if (Math.abs(userVal - correctVal) > 0.001) correct = false;
            }
            // Track user answer for summary
            userAnswers[turn - 1] = userVals.slice();
            if (correct) {
                $('#sim-hint').html('');
                if (turn < words.length) {
                    // Go to next column
                    $('#viterbi-feedback').html('<span style="color:green;">Right Answer! Go to next step.</span>');
                    setTimeout(function() {
                        renderViterbiStep(corpus, turn + 1, Array(corpus.pos.length).fill(''));
                    }, 800);
                } else {
                    // All columns done
                    $('#sim-progress-bar').css({width: '100%'});
                    simulationComplete = true;
                    $('#viterbi-table-div').html(renderViterbiTable(corpus, turn + 1, Array(corpus.pos.length).fill('')));
                    $('#viterbi-feedback').html('<span style="color:green;">All steps correct!<br/><button id="show-pos-btn" class="sim-btn">Check Part of Speech</button></span>');
                    // Only show Check and Reset, disable others
                    $('#show-answer-btn, #show-hint-btn').prop('disabled', true).css({'opacity':0.5, 'cursor':'not-allowed'});
                    $('#viterbi-check-btn').show();
                    $('#restart-btn').show();
                    // Hide/disable other controls
                    $(document).off('click', '#show-answer-btn');
                    $(document).off('click', '#show-hint-btn');
                    $('#show-pos-btn').off('click').on('click', function() {
                        showPOS(corpus);
                        // After final table, disable all except Reset
                        $('#viterbi-check-btn, #show-answer-btn, #show-hint-btn').prop('disabled', true).css({'opacity':0.5, 'cursor':'not-allowed'});
                    });
                }
            } else {
                // Show inline explanation for wrong answer
                $('#viterbi-feedback').html('<span style="color:red;">Wrong Answer! Try again.</span>');
                $('#sim-hint').html('<div class="sim-hint" tabindex="0">Remember: ' + viterbiHints[(turn - 1) % viterbiHints.length] + '</div>');
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
    corpus.sentencePos.forEach(w => {
        posRow += '<th>' + w + '</th>';
    });
    posRow += '</tr><tr>';
    corpus.sentencePos.forEach(tag => {
        posRow += '<td class="sim-pos-tag">' + tag + '</td>';
    });
    posRow += '</tr></table>';
    $('#viterbi-table-div').append(posRow);
    $('#viterbi-feedback').html('<span style="color:green;">Simulation complete!</span>');
}

function showViterbiAnswer(corpus, turn) {
    // Show a side-by-side comparison: user input vs. correct answer for the current step
    const words = corpus.sentence.split(/\s+/);
    const pos = corpus.pos;
    const viterbi = corpus.viterbi;
    const userStep = userAnswers[turn - 1] || [];
    let html = '<h4>Step ' + turn + ' Answer Comparison</h4>';
    html += '<table class="sim-table" style="max-width:600px;margin:auto;">';
    html += '<tr><th>POS</th><th>Your Value</th><th>Correct Value</th></tr>';
    for (let i = 0; i < pos.length; i++) {
        let userVal = userStep[i];
        let correctVal = viterbi[i][turn - 1];
        let isCorrect = (parseFloat(userVal) === correctVal);
        let userDisplay = '';
        if (userVal === undefined || userVal === null || userVal === '') {
            userDisplay = '?';
        } else if (isNaN(parseFloat(userVal))) {
            userDisplay = 'Invalid';
        } else {
            userDisplay = userVal;
        }
        let correctDisplay = (!Number.isFinite(Number(correctVal)) ? 'N/A' : correctVal);
        html += '<tr>';
        html += '<td>' + pos[i] + '</td>';
        html += '<td style="background:' + (isCorrect ? '#eaffea' : '#ffeaea') + ';">' + userDisplay + '</td>';
        html += '<td style="background:#eaffea;font-weight:bold;">' + correctDisplay + '</td>';
        html += '</tr>';
    }
    html += '</table>';
    html += '<div style="font-size:0.95em;margin-top:8px;color:#555;">Legend: <b>N/A</b> = Not Available in data, <b>?</b> = No input, <b>Invalid</b> = Not a number</div>';
    $('#viterbi-feedback').html(html);
}
