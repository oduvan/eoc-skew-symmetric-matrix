//Dont change it
requirejs(['ext_editor_1', 'jquery_190', 'raphael_210'],
    function (ext, $, TableComponent) {

        var cur_slide = {};

        ext.set_start_game(function (this_e) {
        });

        ext.set_process_in(function (this_e, data) {
            cur_slide["in"] = data[0];
        });

        ext.set_process_out(function (this_e, data) {
            cur_slide["out"] = data[0];
        });

        ext.set_process_ext(function (this_e, data) {
            cur_slide.ext = data;
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_process_err(function (this_e, data) {
            cur_slide['error'] = data[0];
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_animate_success_slide(function (this_e, options) {
            var $h = $(this_e.setHtmlSlide('<div class="animation-success"><div></div></div>'));
            this_e.setAnimationHeight(115);
        });

        ext.set_animate_slide(function (this_e, data, options) {
            var $content = $(this_e.setHtmlSlide(ext.get_template('animation'))).find('.animation-content');
            if (!data) {
                console.log("data is undefined");
                return false;
            }

            var checkioInput = data.in;

            if (data.error) {
                $content.find('.call').html('Fail: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.output').html(data.error.replace(/\n/g, ","));

                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
                $content.find('.answer').remove();
                $content.find('.explanation').remove();
                this_e.setAnimationHeight($content.height() + 60);
                return false;
            }

            var rightResult = data.ext["answer"];
            var userResult = data.out;
            var result = data.ext["result"];
            var result_addon = data.ext["result_addon"];


            //if you need additional info from tests (if exists)
            var explanation = data.ext["explanation"];

            $content.find('.output').html('&nbsp;Your result:&nbsp;' + JSON.stringify(userResult));

            if (!result) {
                $content.find('.call').html('Fail: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.answer').html('Right result:&nbsp;' + JSON.stringify(rightResult));
                $content.find('.answer').addClass('error');
                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
            }
            else {
                $content.find('.call').html('Pass: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.answer').remove();
            }
            //Dont change the code before it

            var eCanvas = new TransposedMatrixCanvas();
            eCanvas.createCanvas($content.find(".explanation")[0], checkioInput);


            this_e.setAnimationHeight($content.height() + 60);

        });

        var $tryit;

        ext.set_console_process_ret(function (this_e, ret) {
            $tryit.find(".checkio-result-in").html("Your result:<br>" + ret);
        });

        ext.set_generate_animation_panel(function (this_e) {

            $tryit = $(this_e.setHtmlTryIt(ext.get_template('tryit')));
            var tCanvas = new TransposedMatrixCanvas();

            $tryit.find(".bn-skew").click(function (e) {
                e.stopPropagation();
                var matrix = [];
                for (var i = 0; i < 5; i++) {
                    var temp = [];
                    for (var j = 0; j < 5; j++) {
                        if (i === j) {
                            temp.push(0);
                        }
                        else if (j > i) {
                            temp.push(Math.floor(Math.random() * 18 - 9));
                        }
                        else {
                            temp.push(-matrix[j][i]);
                        }
                    }
                    matrix.push(temp);

                }
                sendData(matrix);
            });

            $tryit.find(".bn-non-zero").click(function (e) {
                e.stopPropagation();
                var matrix = [];
                for (var i = 0; i < 5; i++) {
                    var temp = [];
                    for (var j = 0; j < 5; j++) {
                        if (i === j) {
                            temp.push(Math.floor(Math.random() * 18 - 9));
                        }
                        else if (j > i) {
                            temp.push(Math.floor(Math.random() * 18 - 9));
                        }
                        else {
                            temp.push(-matrix[j][i]);
                        }
                    }
                    matrix.push(temp);

                }
                sendData(matrix);
            });

            $tryit.find(".bn-non-skew").click(function (e) {
                e.stopPropagation();
                var matrix = [];
                for (var i = 0; i < 5; i++) {
                    var temp = [];
                    for (var j = 0; j < 5; j++) {
                        if (i === j) {
                            temp.push(0);
                        }
                        else {
                            temp.push(Math.floor(Math.random() * 18 - 9));
                        }
                    }
                    matrix.push(temp);

                }
                sendData(matrix);
            });

            var sendData = function (data) {
                tCanvas.removeCanvas();
                $tryit.find("table tr:first").show();
                tCanvas.createCanvas($tryit.find(".tryit-canvas")[0], data, true);
                this_e.sendToConsoleCheckiO(data);

                return false;
            };

        });

        function TransposedMatrixCanvas() {
            var zx = 40;
            var zy = 10;
            var cellSize = 30;
            var cellN = [];
            var fullSize = [];
            var maxSize;
            var delay = 1000;

            var colorDark = "#294270";
            var colorOrange = "#F0801A";
            var attrBracket = {"stroke": colorDark, "stroke-width": 3};
            var attrNumber = {"stroke": colorDark, "font-family": "Verdana", "font-size": cellSize * 0.6};
            var attrWrongNumber = {"stroke": colorOrange, "fill": colorOrange, "font-family": "Verdana", "font-size": cellSize * 0.6};
            var attrSup = {"stroke": colorDark, "font-family": "Verdana", "font-size": cellSize * 0.35, "opacity": 0};

            var paper;
            var numberSet;
//            var letterT;
            var letterA;
            var leftBracket;
            var rightBracket;

            function createBracketPath(x0, y0, y1, left) {
                return Raphael.fullfill(
                    "M{XS},{y0}H{x0}V{Y1}H{XS}",
                    {
                        XS: x0 + (left ? 1 : -1) * cellSize / 6,
                        x0: x0,
                        y0: y0,
                        Y1: y1
                    }
                )
            }

            this.removeCanvas = function () {
                if (paper) {
                    paper.remove();
                }
            };

            this.createCanvas = function (dom, matrix, shortCanvas) {
                if (shortCanvas) {
                    zx = 10;
                }
                cellN = [matrix[0].length, matrix.length];

                maxSize = Math.max(cellN[0] * cellSize, cellN[1] * cellSize);
                fullSize = [zx * 2 + maxSize, zy * 2 + maxSize];
                paper = Raphael(dom, fullSize[0], fullSize[1], 0, 0);
                numberSet = paper.set();

                if (!shortCanvas) {
                    letterA = paper.text(zx / 2, zy + cellSize * cellN[1] / 2, "A").attr(attrNumber);
//                    letterT = paper.text(zx / 2 + cellSize / 5, zy + cellSize * cellN[1] / 2 - cellSize / 6, "T").attr(attrSup);
                }
                leftBracket = paper.path(
                    createBracketPath(
                        zx,
                        zy,
                        zy + cellSize * cellN[1], true)
                ).attr(attrBracket);
                rightBracket = paper.path(
                    createBracketPath(
                        zx + cellN[0] * cellSize,
                        zy,
                        zy + cellSize * cellN[1], false)
                ).attr(attrBracket);
                for (var row = 0; row < matrix.length; row++) {
                    for (var col = 0; col < matrix[0].length; col++) {
                        numberSet.push(paper.text(
                            zx + cellSize * col + cellSize / 2,
                            zy + cellSize * row + cellSize / 2,
                            matrix[row][col]
                        ).attr(matrix[row][col] === -1 * matrix[col][row] ? attrNumber : attrWrongNumber));
                    }
                }
            };


        }

    }
);
