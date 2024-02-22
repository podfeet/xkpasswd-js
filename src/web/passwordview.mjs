import log from 'loglevel';

/**
 * This class handles the rendering of
 * and interaction with the password and stats
 *
 * @class PasswordView
 */
class PasswordView {
  /**
   * @private {number} aniTime - set time to show/hide elements
   */
  #aniTime = 250;

  /**
   *  set the Bootstrap classes for the various values
   * @private
   */
  #stats_classes = {
    GOOD: {
      display: 'Good',
      class: 'btn-success',
    },
    OK: {
      display: 'OK',
      class: 'btn-warning',
    },
    POOR: {
      display: 'Poor',
      class: 'btn-danger',
    },
    UNKNOWN: {
      display: 'Unknown',
      class: 'btn-danger',
    },
  };

  #passwordArea;
  #passwordErrorContainer;
  #passwordStatsContainer;
  #passwordStrength;
  #blindEntropy;
  #seenEntropy;
  #entropySuggestion;
  #numberOfPasswords;
  /**
   * @constructor
   */
  constructor() {
    this.#passwordArea = $('textarea#generated_password');
    this.#passwordErrorContainer = $('#passwordErrorContainer');
    this.#passwordStatsContainer = $('#password_stats_container');
    this.#passwordStrength = $('#password_strength');
    this.#blindEntropy = $('#entropy_blind');
    this.#seenEntropy = $('#entropy_seen');
    this.#entropySuggestion = $('#entropy_suggestion');
    this.#numberOfPasswords = $('#selectAmount');

    this.#passwordArea.val('');

    this.__hideStats();
  };

  /**
   * Render the password and statistics
   *
   * @param {Object} passAndStats - object with passwords and stats
   * @param {number} num - number of passwords generated
   */
  renderPassword(passAndStats, num) {
    log.trace(`renderPassword: ${JSON.stringify(passAndStats)}`);

    const passwds = passAndStats.passwords.join('\n');
    this.#passwordArea.val(passwds);
    // Set passwordArea height to accommodate number of passwords
    this.#passwordArea.attr('rows', num);
    log.trace(
      `texarea value changed to [${this.#passwordArea.val()}]`);
    this.__renderDetailedStats(passAndStats.stats);
  };

  /**
   * bind the Generate button to the eventhandler
   * @param {Function} handle - pass control to the Controller
   */
  bindGeneratePassword(handle) {
    log.trace('bindGeneratePassword');

    $('form#generatePasswords').on('submit', (e) => {
      e.preventDefault();
      e.stopPropagation(); // stop the event bubbling

      const num = parseInt(this.#numberOfPasswords.val());
      handle(num);
    });
  };


  /**
   * hide statistics section
   *
   * @private
   */
  __hideStats() {
    this.#passwordStatsContainer.addClass('d-none');
  };

  /**
   * show statistics section
   *
   * @private
   */
  __showStats() {
    this.#passwordStatsContainer.removeClass('d-none');
  };

  /**
   * Show an alert with an error message
   * @param {string} msg - the error message
   *
   */
  renderPasswordError(msg) {
    // write the error message to the alert and show it

    /* eslint-disable max-len */
    const alertBox = [
      `<div class="alert alert-danger d-flex align-items-center alert-dismissible fade show" role="alert">`,
      `  <span class="text-danger"><i class="bi bi-exclamation-square-fill"></i>&nbsp;</span>`,
      `  <div id="generate_password_errors">${msg}</div>`,
      `  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`,
      '</div>',
    ].join('');
      /* eslint-enable max-len */

    this.#passwordErrorContainer.append(alertBox);

    this.__hideStats();
  };

  /**
   * Render the details of the statistics
   * @param {object} stats - object holding the statistics
   *
   * @private
   */
  __renderDetailedStats(stats) {
    log.trace(`entering __renderDetailedStats`);
    log.trace(`stats: ${JSON.stringify(stats)}`);

    this.__renderPasswordStrength(stats.password.passwordStrength);

    // Render the detailed stats

    let template = {};
    const min = stats.entropy.minEntropyBlind;
    const max = stats.entropy.maxEntropyBlind;

    // first the blind entropy

    /* eslint-disable max-len */

    if (min.equal) {
      // make a template for one value

      template = [
        `<span class="btn btn-stats ${this.__getStatsClass([min.state])}"`,
        `id="entropy_min">${min.value} bits</span>`,
      ].join('');
    } else {
      // make a template for two values
      template = [
        `&nbsp;between <span class="btn btn-stats ${this.__getStatsClass([min.state])}"`,
        `id="entropy_min">${min.value} bits</span> and `,
        `<span class="btn btn-stats ${this.__getStatsClass([max.state])}"`,
        `id="entropy_max">${max.value} bits</span>`,
      ].join('');
    }
    /* eslint-enable max-len */

    log.trace(`template built: ${template}`);


    this.#blindEntropy.empty().append(template);

    // seen entropy
    this.#seenEntropy.html(stats.entropy.entropySeen.value + ' bits')
      .addClass(this.#stats_classes[stats.entropy.entropySeen.state]);

    const suggestion =
      // eslint-disable-next-line max-len
      `(suggest keeping blind entropy above ${stats.entropy.blindThreshold} bits ` +
      `and seen above ${stats.entropy.seenThreshold} bits)`;
    this.#entropySuggestion.html(suggestion);

    this.__showStats();
  };

  /**
   * Render the password strength
   *
   * @param {string} passwordStrength - indication of the password strength
   */
  __renderPasswordStrength(passwordStrength) {
    // we assume that the strength indicator is already calculated

    const statsText = this.__getStatsDisplay(passwordStrength);
    const statsClass = this.__getStatsClass([passwordStrength]);

    // render strength
    this.#passwordStrength.text(statsText);
    this.#passwordStrength.addClass(statsClass);
  };

  /**
   * Return the Bootstrap class to indicate the strength
   *
   * @private
   *
   * @param {string} strength - indication of strength
   * @return {string} - css class
   */
  __getStatsClass(strength) {
    return this.#stats_classes[strength].class;
  };

  /**
   * Return the display name to indicate the strength
   *
   * @param {string} strength - indication of strength
   * @return {string} - display name
   *
   * @private
   */
  __getStatsDisplay(strength) {
    return this.#stats_classes[strength].display;
  }
};

export {PasswordView};
