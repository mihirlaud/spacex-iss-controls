(function() {
    /**
     * Check and set a global guard variable.
     * If this content script is injected into the same page again,
     * it will do nothing next time.
     */
    if (window.hasRun) {
      return;
    }
    window.hasRun = true;

    function pyrPIDCommand(n, dim_name) {
        let dim_rate_str = document.getElementById(dim_name).childNodes[3].textContent;
        let dim_rate = parseFloat(dim_rate_str.substring(0, dim_rate_str.length - 4));
        let diff = n - dim_rate;

        var id;
        if (diff > 0) {
            if (dim_name != "pitch") {
                id = dim_name.concat("-right-button");
            } else {
                id = dim_name.concat("-down-button");
            }
        } else {
            if (dim_name != "pitch") {
                id = dim_name.concat("-left-button");
            } else {
                id = dim_name.concat("-up-button");
            }
        }

        var i;
        for(i = 0; i < Math.abs(diff); i++) {
            document.getElementById(id).click();
        }
    }

    var r = 0;
    function xyzPIDCommand(n, dim_name) {
        let diff = n - r;
        r = n;

        var id;
        if (diff > 0) {
            switch(dim_name) {
                case "x":
                    id = "translate-forward-button";
                    break;
                case "y":
                    id = "translate-left-button";
                    break;
                case "z":
                    id = "translate-down-button";
                    break;
            }
        } else {
            switch(dim_name) {
                case "x":
                    id = "translate-backward-button";
                    break;
                case "y":
                    id = "translate-right-button";
                    break;
                case "z":
                    id = "translate-up-button";
                    break;
            }
        }

        var i;
        for(i = 0; i < Math.abs(diff * 200); i++) {
            document.getElementById(id).click();
        }
    }

    var z_align = false;
    function z_dock() {
        var prev_z = 0;
        var z_timer = setInterval(function () {
            let z_str = document.getElementById("z-range").childNodes[1].textContent;
            let z = parseFloat(z_str.substring(0, z_str.length - 1));
            
            if (Math.abs(z) <= 0.0) {
                xyzPIDCommand(0, "z");
                z_align = true;
                var maintain_z = setInterval(function () {
                    let z_str = document.getElementById("z-range").childNodes[1].textContent;
                    let z = parseFloat(z_str.substring(0, z_str.length - 1));
                    if (z >= 0.1) {
                        document.getElementById("translate-down-button").click();
                    } else if (z <= -0.1) {
                        document.getElementById("translate-up-button").click();
                    }

                    if (document.getElementById("success").style.visibility != "hidden" || document.getElementById("fail").style.visibility != "hidden") {
                        clearInterval(maintain_z);
                    }
                }, 500);
                clearInterval(z_timer);
            } else {
                const kP = 0.5;
                const kD = 1.2;

                let p = kP * z;
                let d = kD * (z - prev_z);
                let com = p + d;
                if (com > 1) {
                    com = 1;
                } else if (com < -1) {
                    com = -1;
                }
                com = Math.round(com * 10) / 50;
                xyzPIDCommand(com, "z");
                prev_z = z;
            }
        });
    }

    var y_align = false;
    function y_dock() {
        var prev_y = 0;
        var y_timer = setInterval(function () {
            let y_str = document.getElementById("y-range").childNodes[1].textContent;
            let y = parseFloat(y_str.substring(0, y_str.length - 1));
            
            if (Math.abs(y) <= 0.0) {
                xyzPIDCommand(0, "y");
                y_align = true;
                var maintain_y = setInterval(function () {
                    let y_str = document.getElementById("y-range").childNodes[1].textContent;
                    let y = parseFloat(y_str.substring(0, y_str.length - 1));
                    if (y >= 0.1) {
                        document.getElementById("translate-left-button").click();
                    } else if (y <= -0.1) {
                        document.getElementById("translate-right-button").click();
                    }

                    if (document.getElementById("success").style.visibility != "hidden" || document.getElementById("fail").style.visibility != "hidden") {
                        clearInterval(maintain_y);
                    }
                }, 500);
                clearInterval(y_timer);
            } else {
                const kP = 0.5;
                const kD = 1.2;

                let p = kP * y;
                let d = kD * (y - prev_y);
                let com = p + d;
                if (com > 1) {
                    com = 1;
                } else if (com < -1) {
                    com = -1;
                }
                com = Math.round(com * 10) / 50;
                xyzPIDCommand(com, "y");
                prev_y = y;
            }

        });
    }

    var x_align = false;
    function x_dock() {
        var prev_x = 0;
        var x_timer = setInterval(function () {
            let x_str = document.getElementById("x-range").childNodes[1].textContent;
            let x = parseFloat(x_str.substring(0, x_str.length - 1));
            
            if (Math.abs(x) <= 0.2) {
                xyzPIDCommand(0, "x");
                x_align = true;
                var maintain_x = setInterval(function () {
                    let x_str = document.getElementById("x-range").childNodes[1].textContent;
                    let x = parseFloat(x_str.substring(0, x_str.length - 1));
                    if (x > 0.2) {
                        document.getElementById("translate-forward-button").click();
                    } else if (x <= 0) {
                        document.getElementById("translate-backward-button").click();
                    }

                    if (document.getElementById("success").style.visibility != "hidden" || document.getElementById("fail").style.visibility != "hidden") {
                        clearInterval(maintain_x);
                    }
                }, 500);
                clearInterval(x_timer);
            } else {
                const kP = 0.5;
                const kD = 2.5;

                let p = kP * x;
                let d = kD * (x - prev_x);
                let com = p + d;
                if (com > 1) {
                    com = 1;
                } else if (com < -1) {
                    com = -1;
                }
                com = Math.round(com * 10) / 50;
                xyzPIDCommand(com, "x");
                prev_x = x;
            }

        });
    }
  
    function runControls() {
        z_align = false;
        y_align = false;
        x_align = false;

        var p_align = false, yaw_align = false, r_align = false;

        var roll_timer = setInterval(function () {
            let roll_str = document.getElementById("roll").childNodes[1].textContent;
            let roll = parseFloat(roll_str.substring(0, roll_str.length - 1));
            
            if (Math.abs(roll) <= 0.1) {
                pyrPIDCommand(0, "roll");
                r_align = true;
                clearInterval(roll_timer);
            } else {
                const kP = 0.3;
                let p = kP * roll;
                if (p > 1) {
                    p = 1;
                } else if (p < -1) {
                    p = -1;
                }
                p = Math.round(p * 10) / 10;
                pyrPIDCommand(p, "roll");
            }
        });


        var yaw_timer = setInterval(function () {
            let yaw_str = document.getElementById("yaw").childNodes[1].textContent;
            let yaw = parseFloat(yaw_str.substring(0, yaw_str.length - 1));
            
            if (Math.abs(yaw) <= 0.1) {
                pyrPIDCommand(0, "yaw");
                yaw_align = true;
                clearInterval(yaw_timer);
            } else {
                const kP = 0.3;
                let p = kP * yaw;
                if (p > 1) {
                    p = 1;
                } else if (p < -1) {
                    p = -1;
                }
                p = Math.round(p * 10) / 10;
                pyrPIDCommand(p, "yaw");
            }
        });

        var pitch_timer = setInterval(function () {
            let pitch_str = document.getElementById("pitch").childNodes[1].textContent;
            let pitch = parseFloat(pitch_str.substring(0, pitch_str.length - 1));
            
            if (Math.abs(pitch) <= 0.1) {
                pyrPIDCommand(0, "pitch");
                p_align = true;
                clearInterval(pitch_timer);
            } else {
                const kP = 0.3;
                let p = kP * pitch;
                if (p > 1) {
                    p = 1;
                } else if (p < -1) {
                    p = -1;
                }
                p = Math.round(p * 10) / 10;
                pyrPIDCommand(p, "pitch");
            }
        });

        var check_pyr_align = setInterval(function () {
            if (p_align && yaw_align && r_align) {
                z_dock();
                clearInterval(check_pyr_align);
            }
        });

        var check_z = setInterval(function () {
            if (z_align) {
                y_dock();
                clearInterval(check_z);
            }
        });

        var check_y = setInterval(function () {
            if (y_align) {
                x_dock();
                clearInterval(check_y);
            }
        });
    }

    browser.runtime.onMessage.addListener((message) => {
      if (message.command === "run") {
        runControls();
      }
    });
  
  })();
  