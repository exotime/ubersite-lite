var typewatch = (function(){
    var timer = 0;
    return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
    };
})();

$( document ).ready(function() {
    var id, page;

    $('button[data-action=create-questionnaire]').click(function() {
        $.post('/ajax', {action: 'create-questionnaire'}, function() {
            location.reload();
        });
        $('button').prop('disabled', true);
    });

    $('button[data-action=duplicate]').click(function(event) {
        id = $(event.target).attr('data-id');
        $.post('/ajax', {id: id, action: 'duplicate-questionnaire'}, function() {
            location.reload();
        });
        $('button').prop('disabled', true);
    });
    $('button[data-action=delete]').click(function(event) {
        if (!confirm('Are you sure you want to delete this questionnaire?')) {
            return false;
        }
        id = $(event.target).attr('data-id');
        $.post('/ajax', {id: id, action: 'delete-questionnaire'}, function() {
            location.reload();
        });
        $('button').prop('disabled', true);
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

    $('#save-title').click(function(event) {
        var text = $('#title-editor').val();
        $(event.target).prop('disabled', true).text('Saving...');
        $.post('/ajax', {id: id, action: 'update-title', text: text}, function() {
            $(event.target).prop('disabled', false).text('Save title');
        });
    });

    $('#save-intro-text').click(function(event) {
        var text = $('#intro-text-editor').val();
        $(event.target).prop('disabled', true).text('Saving...');
        $.post('/ajax', {id: id, action: 'update-intro-text', text: text}, function() {
            $(event.target).prop('disabled', false).text('Save intro text');
        });
    });

    $('button[data-action=page-duplicate]').click(function(event) {
        page = $(event.target).attr('data-id');
        $.post('/ajax', {id: id, action: 'duplicate-page', page: page}, function() {
            location.reload();
        });
        $('button').prop('disabled', true);
    });

    $('button[data-action=page-delete]').click(function(event) {
        if (!confirm('Are you sure you want to delete this page?')) {
            return false;
        }
        page = $(event.target).attr('data-id');
        $.post('/ajax', {id: id, action: 'delete-page', page: page}, function() {
            location.reload();
        });
        $('button').prop('disabled', true);
    });

    $('button[data-action=move-page]').click(function(event) {
        var page = $(event.target).attr('data-id');
        var movement = $(event.target).attr('data-movement');
        $.post('/ajax', {id: id, action: 'move-page', page: page, movement: movement}, function() {
            location.reload();
        });
        $('button').prop('disabled', true);
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
    })

    $('#update-page-intro').change(function(event) {
        var text = $(event.target).val();
        showAjax();
        $.post('/ajax', {id: id, action: 'update-page-intro', page: page, text: text}, clearAjax);
    });

    $('#add-section').click(function(event) {
        showAjax();
        $.post('/ajax', {id: id, action: 'add-section', page: page}, reloadPage);
        $('button').prop('disabled', true);
    });

    $('button[data-action=duplicate-section]').click(function(event) {
        showAjax();
        var section = $(event.target).attr('data-id');
        $.post('/ajax', {id: id, action: 'duplicate-section', page: page, section: section}, reloadPage);
        $('button').prop('disabled', true);
    });

    $('button[data-action=delete-section]').click(function(event) {
        if (!confirm('Are you sure you want to delete this section?')) {
            return false;
        }
        showAjax();
        var section = $(event.target).attr('data-id');
        $.post('/ajax', {id: id, action: 'delete-section', page: page, section: section}, reloadPage);
        $('button').prop('disabled', true);
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

});
