$( document ).ready(function() {
    var id, page;

    $('button[data-action=create-questionnaire]').click(function() {
        $.post('/ajax', {action: 'create-questionnaire'}, function() {
            location.reload();
        });
        $('button').prop('disabled', true);
    });

    $('button[data-action=duplicate]').click(function(event) {
        var row = $(event.target).parents('tr');
        var id = row.attr('data-id');

        showAjax();
        $.post('/ajax', {id: id, action: 'duplicate-questionnaire'}, function(data) {
            clearAjax();
            var nextRow = row.next();
            nextRow.find('button').prop('disabled', false);
            nextRow.attr('data-id', data);
            nextRow.find('a').attr('href', '/editor/' + data);
            var cell = nextRow.children().first();
            cell.text(data);
            cell.effect('highlight');
        });

        var clone = row.clone(true);
        clone.children().first().text('');
        clone.find('button').prop('disabled', true);
        clone.find('a').removeAttr('href');
        clone.removeAttr('data-id');
        clone.insertAfter(row).effect('highlight');
    });
    $('button[data-action=delete]').click(function(event) {
        if (!confirm('Are you sure you want to delete this questionnaire?')) {
            return false;
        }

        var row = $(event.target).parents('tr');
        var id = row.attr('data-id');

        showAjax();
        $.post('/ajax', {id: id, action: 'delete-questionnaire'}, clearAjax);

        row.effect({effect: 'fade', complete: function() {
            row.remove();
        }});
    });

    var hiddenId;
    if (hiddenId = $('#questionnaire-id')) {
        id = hiddenId.val();
    }
    if (hiddenId = $('#page-number')) {
        page = hiddenId.val();
    }

    var ajaxStatus = $('#ajax-status');
    var activeCalls = 0;
    var timeout;

    function showAjax() {
        clearInterval(timeout);
        ajaxStatus.show();
        ajaxStatus.children().text('Saving...');
        activeCalls++;
    }

    function clearAjax() {
        activeCalls--;
        if (activeCalls == 0) {
            ajaxStatus.children().text('Saved!');
            timeout = setTimeout(function() {
                ajaxStatus.hide();
            }, 3000);
        }
    }

    function reloadPage() {
        clearAjax();
        location.reload();
    }

    function reindexPages() {
        $('#page-list').find('tbody tr').each(function (index, value) {
            var row = $(value);
            row.attr('data-id', index + 1);
            row.children().first().text(index + 1);
            row.find('a').attr('href', '/editor/' + id + '/' + (index + 1));
        });
    }

    function reindexSections() {
        $('#all-sections').find('.section').each(function (index, element) {
            $(element).attr('data-id', index);
        });
    }

    $('#update-title').change(function(event) {
        var text = $(event.target).val();
        $.post('/ajax', {id: id, action: 'update-title', page: page, text: text});
    });

    $('#update-intro').change(function(event) {
        var text = $(event.target).val();
        $.post('/ajax', {id: id, action: 'update-intro', page: page, text: text});
    });

    $('button[data-action=page-duplicate]').click(function(event) {
        var row = $(event.target).parents('tr');
        var page = row.attr('data-id');

        showAjax();
        $.post('/ajax', {id: id, action: 'duplicate-page', page: page}, clearAjax);

        row.clone(true).insertAfter(row).effect('highlight');
        reindexPages();
    });

    $('button[data-action=page-delete]').click(function(event) {
        if (!confirm('Are you sure you want to delete this page?')) {
            return false;
        }

        var row = $(event.target).parents('tr');
        var table = row.parents('table');
        var page = row.attr('data-id');

        showAjax();
        $.post('/ajax', {id: id, action: 'delete-page', page: page}, clearAjax);
        row.effect({effect: 'fade', complete: function() {
            row.remove();
            reindexPages();
        }});
    });

    $('button[data-action=page-create]').click(function() {
        $.post('/ajax', {id: id, action: 'create-page'}, function() {
            location.reload();
        });
        $('button').prop('disabled', true);
    });

    $('#update-page-title').change(function(event) {
        var text = $(event.target).val();
        showAjax();
        $.post('/ajax', {id: id, action: 'update-page-title', page: page, text: text}, clearAjax);
    });

    $('#update-page-intro').change(function(event) {
        var text = $(event.target).val();
        showAjax();
        $.post('/ajax', {id: id, action: 'update-page-intro', page: page, text: text}, clearAjax);
    });

    $('#add-section').click(function() {
        showAjax();
        $.post('/ajax', {id: id, action: 'add-section', page: page}, reloadPage);
        $('button').prop('disabled', true);
    });

    $('button[data-action=duplicate-section]').click(function(event) {
        var sectionElement = $(event.target).parents('.section');
        var section = sectionElement.attr('data-id');

        showAjax();
        $.post('/ajax', {id: id, action: 'duplicate-section', page: page, section: section}, clearAjax);

        sectionElement.clone(true).insertAfter(sectionElement).effect('highlight');
        reindexSections();
    });

    $('button[data-action=delete-section]').click(function(event) {
        if (!confirm('Are you sure you want to delete this section?')) {
            return false;
        }

        var sectionElement = $(event.target).parents('.section');
        var section = sectionElement.attr('data-id');

        showAjax();
        $.post('/ajax', {id: id, action: 'delete-section', page: page, section: section}, clearAjax);

        sectionElement.effect({effect: 'fade', complete: function() {
            sectionElement.remove();
            reindexSections();
        }});

    });

    $('input[data-action=update-section-title]').change(function(event) {
        showAjax();
        var text = $(event.target).val();
        var section = $(event.target).attr('data-id');
        $.post('/ajax', {id: id, action: 'update-section-title', page: page, section: section, text: text}, clearAjax);
    });

    $('input[data-action=section-collapsible]').change(function(event) {
        showAjax();
        var value = $(event.target).prop("checked") ? 1 : 0;
        var section = $(event.target).attr('data-id');
        $.post('/ajax', {id: id, action: 'section-collapsible', page: page, section: section, value: value}, clearAjax);
    });

    $('button[data-action=move-section]').click(function(event) {
        showAjax();
        var section = $(event.target).attr('data-id');
        var movement = $(event.target).attr('data-movement');
        $.post('/ajax', {id: id, action: 'move-section', page: page, section: section, movement: movement}, reloadPage);
    });

    $('a[data-action=delete-question]').click(function(event) {
        if (!confirm('Delete this question?')) {
            return false;
        }
        showAjax();
        var section = $(event.target).parents('.section').attr('data-id');
        var question = $(event.target).parents('.fake-question').attr('data-question');
        $.post('/ajax', {id: id, action: 'delete-question', page: page, section: section, question: question}, reloadPage);
    });

    $('button[data-action=add-question]').click(function(event) {
        var section = $(event.target).parents('.section').attr('data-id');
        var question = $(event.target).prev().find('input[type=text]').val();
        var answerType = $(event.target).prev().find('select').val();

        if (question == '') {
            alert("You need to fill in the question text.");
            return false;
        }

        var data = {
            id: id, action: 'add-question', page: page, section: section, question: question, answerType: answerType
        };

        if (answerType == 'Radio' || answerType == 'Dropdown') {
            var answerOptions = [];
            $(event.target).prev().find('.answer-options input[type=text]').each(function() {
                if ($(this).val() != '') {
                    answerOptions.push($(this).val());
                }
            });
            if (answerOptions.length == 0) {
                alert("You need to fill in at least one option.");
                return false;
            }
            data.answerOptions = answerOptions;
        }
        $('button').prop('disabled', true);
        showAjax();
        $.post('/ajax', data, reloadPage);
    });

    $('button[data-action=show-add-question]').click(function(event) {
        $(event.target).parents('.fake-question').next().toggle();
    });

    $('.editor .section select').change(function(event) {
        var selected = $(event.target).val();
        var extraBoxes = $(event.target).parents('tbody').children('.answer-options');
        if (selected == 'Radio' || selected == 'Dropdown') {
            extraBoxes.show();
        } else {
            extraBoxes.hide();
        }
    });

    $('input[data-action=add-radio-box]').click(function(event) {
        var element = $(event.target).parent().prev().clone(true);
        element.find('input').val('');
        $(event.target).parent().before(element);
        $(event.target).parents('ul').find('input[type=text]').eq(-2).focus();
        $(event.target).parents('ul').find('a').show();
    });

    $('a[data-action=delete-radio-box]').click(function(event) {
        var siblings = $(event.target).parent().siblings().length;
        if (siblings > 1) {
            if (siblings == 2) {
                $(event.target).parents('tr').find('a').hide();
            }
            $(event.target).parent().remove();
        }
    });

    $('.sortable tbody').sortable({
        handle: '.handle',
        axis: 'y',
        start: function (event, ui) {
            var children = ui.item.children();
            ui.placeholder.children().each(function(index, value) {
                $(value).replaceWith($(children[index]).clone());
            });
            ui.item.addClass('being-dragged');
        },
        stop: function (event, ui) {
            ui.item.removeClass('being-dragged');

            var page = ui.item.attr('data-id');
            var newPosition = ui.item.index() + 1;

            showAjax();
            $.post('/ajax', {id: id, action: 'move-page', page: page, newPosition: newPosition}, clearAjax);
            reindexPages();
        },
        placeholder: 'placeholder',
        helper: function (event, ui) {
            ui.children().each(function () {
                $(this).width($(this).width());
            });
            return ui;
        }
    });

    $('#all-sections').sortable({
        handle: '.handle',
        axis: 'y',
        constrain: 'parent',
        stop: function (event, ui) {
            var section = ui.item.attr('data-id');
            var newPosition = ui.item.index();

            showAjax();
            $.post('/ajax', {id: id, action: 'move-section', page: page, section: section, newPosition: newPosition}, clearAjax);
            reindexSections();
        }
    });
});
