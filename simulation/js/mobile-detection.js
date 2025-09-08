(function () {
  "use strict";

  // Configuration
  const config = {
    minDesktopWidth: 768,
    minLandscapeWidth: 1024,
    alertDelay: 1000,
    experimentName: "POS Tagging - Viterbi Decoding",
  };

  // Device detection utilities
  const DeviceDetector = {
    isMobile: function () {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    },

    isTablet: function () {
      return (
        /iPad|Android/i.test(navigator.userAgent) &&
        window.innerWidth >= 768 &&
        window.innerWidth <= 1024
      );
    },

    isSmallScreen: function () {
      return window.innerWidth < config.minDesktopWidth;
    },

    isPortrait: function () {
      return window.innerHeight > window.innerWidth;
    },

    isLandscapeButSmall: function () {
      return !this.isPortrait() && window.innerWidth < config.minLandscapeWidth;
    },
  };

  // Alert message creator
  const AlertMessage = {
    createMobileAlert: function () {
      return {
        title: "Desktop Experience Recommended",
        message: `The ${config.experimentName} experiment is optimized for desktop viewing. For the best experience with the Viterbi decoding tables and interactive elements, please use a desktop or laptop computer.`,
        type: "mobile",
      };
    },

    createLandscapeAlert: function () {
      return {
        title: "Rotate to Landscape Mode",
        message: `Please rotate your device to landscape mode for better viewing of the ${config.experimentName} experiment. The Viterbi matrices and probability tables require more screen width to display properly.`,
        type: "landscape",
      };
    },

    createSmallScreenAlert: function () {
      return {
        title: "Screen Size Notice",
        message: `The ${config.experimentName} experiment contains complex tables and matrices that work best on larger screens. Consider using a device with a larger display for optimal experience.`,
        type: "smallscreen",
      };
    },
  };

  // Alert display system
  const AlertDisplay = {
    activeAlert: null,

    show: function (alertData) {
      this.hide(); // Remove any existing alert

      const alertDiv = document.createElement("div");
      alertDiv.id = "mobile-detection-alert";
      alertDiv.className = `alert-overlay alert-${alertData.type}`;

      alertDiv.innerHTML = `
                <div class="alert-content">
                    <div class="alert-header">
                        <h3>${alertData.title}</h3>
                        <button class="alert-close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                    </div>
                    <div class="alert-body">
                        <p>${alertData.message}</p>
                    </div>
                    <div class="alert-footer">
                        <button class="alert-btn alert-btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">
                            Continue Anyway
                        </button>
                    </div>
                </div>
            `;

      // Add styles
      this.addStyles();

      document.body.appendChild(alertDiv);
      this.activeAlert = alertDiv;

      // Auto-hide after 10 seconds for landscape alerts
      if (alertData.type === "landscape") {
        setTimeout(() => {
          if (
            this.activeAlert &&
            this.activeAlert.id === "mobile-detection-alert"
          ) {
            this.hide();
          }
        }, 10000);
      }
    },

    hide: function () {
      const existingAlert = document.getElementById("mobile-detection-alert");
      if (existingAlert) {
        existingAlert.remove();
        this.activeAlert = null;
      }
    },

    addStyles: function () {
      if (document.getElementById("mobile-detection-styles")) return;

      const styles = document.createElement("style");
      styles.id = "mobile-detection-styles";
      styles.textContent = `
                .alert-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .alert-content {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                }

                .alert-header {
                    background: #2c5aa0;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 8px 8px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .alert-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                }

                .alert-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background-color 0.2s;
                }

                .alert-close:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                }

                .alert-body {
                    padding: 20px;
                    line-height: 1.6;
                    color: #333;
                }

                .alert-body p {
                    margin: 0;
                    font-size: 16px;
                }

                .alert-footer {
                    padding: 0 20px 20px;
                    text-align: right;
                }

                .alert-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: background-color 0.2s;
                }

                .alert-btn-primary {
                    background: #2c5aa0;
                    color: white;
                }

                .alert-btn-primary:hover {
                    background: #1e3d6f;
                }

                .alert-mobile .alert-header {
                    background: #dc3545;
                }

                .alert-landscape .alert-header {
                    background: #fd7e14;
                }

                .alert-smallscreen .alert-header {
                    background: #6f42c1;
                }

                @media (max-width: 480px) {
                    .alert-content {
                        width: 95%;
                        margin: 10px;
                    }
                    
                    .alert-header {
                        padding: 12px 15px;
                    }
                    
                    .alert-header h3 {
                        font-size: 16px;
                    }
                    
                    .alert-body {
                        padding: 15px;
                    }
                    
                    .alert-body p {
                        font-size: 14px;
                    }
                }
            `;
      document.head.appendChild(styles);
    },
  };

  // Main detection and alert logic
  const MobileDetection = {
    lastOrientation: null,
    alertShown: false,

    init: function () {
      this.checkDevice();
      this.setupEventListeners();
    },

    checkDevice: function () {
      if (DeviceDetector.isMobile()) {
        if (DeviceDetector.isPortrait()) {
          this.showAlert(AlertMessage.createLandscapeAlert());
        } else if (DeviceDetector.isLandscapeButSmall()) {
          this.showAlert(AlertMessage.createMobileAlert());
        }
      } else if (DeviceDetector.isSmallScreen()) {
        this.showAlert(AlertMessage.createSmallScreenAlert());
      }
    },

    showAlert: function (alertData) {
      if (!this.alertShown) {
        setTimeout(() => {
          AlertDisplay.show(alertData);
          this.alertShown = true;
        }, config.alertDelay);
      }
    },

    setupEventListeners: function () {
      let resizeTimer;

      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          this.handleResize();
        }, 250);
      });

      window.addEventListener("orientationchange", () => {
        setTimeout(() => {
          this.handleOrientationChange();
        }, 500);
      });
    },

    handleResize: function () {
      if (DeviceDetector.isMobile()) {
        if (DeviceDetector.isPortrait() && !AlertDisplay.activeAlert) {
          AlertDisplay.show(AlertMessage.createLandscapeAlert());
        } else if (!DeviceDetector.isPortrait() && AlertDisplay.activeAlert) {
          AlertDisplay.hide();
        }
      }
    },

    handleOrientationChange: function () {
      const currentOrientation = DeviceDetector.isPortrait()
        ? "portrait"
        : "landscape";

      if (this.lastOrientation !== currentOrientation) {
        this.lastOrientation = currentOrientation;

        if (DeviceDetector.isMobile()) {
          if (currentOrientation === "portrait") {
            AlertDisplay.show(AlertMessage.createLandscapeAlert());
          } else {
            AlertDisplay.hide();
            if (DeviceDetector.isLandscapeButSmall()) {
              AlertDisplay.show(AlertMessage.createMobileAlert());
            }
          }
        }
      }
    },
  };

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      MobileDetection.init();
    });
  } else {
    MobileDetection.init();
  }

  // Expose for debugging
  window.MobileDetection = {
    detector: DeviceDetector,
    alertSystem: AlertDisplay,
    reinitialize: () => MobileDetection.init(),
  };
})();
