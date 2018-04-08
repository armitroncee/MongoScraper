$(document).on("click", "#save", function(){
    var Id = $(this).attr("data-id")

    var Saved = {
        saved: true
      };

    $.ajax({
        method: "PUT",
        url: "/articles/" + Id,
        data: Saved
    }).then(function(){
        console.log ("changed saved to ", Saved);
    })
        location.reload();
})

$(document).on("click", "#delete", function(){
    var Id = $(this).attr("data-id")

    var Saved = {
        saved: false
      };

    $.ajax({
        method: "PUT",
        url: "/article/" + Id,
        data: Saved
    }).then(function(){
        console.log ("changed saved to ", Saved);
    })
        location.reload();
})

$('.bd-example-modal-lg').on('hide.bs.modal', function (e) {
    // $(".modal-content").html("<h1>waiting for articles to be scraped</h1>")
    window.location.href = '/';
  });

$("#scrape").on("click", function(event){
    event.preventDefault();

    $.ajax({
        method: "GET",
        url: "/scrape"
    }).done(function(results){
        console.log(results)
        $(".modal-content").html("<h1>Articles are done being scraped</h1>")
    })
})

$(document).on("click", "#savenote", function() {
    var thisId = $(this).attr("data-id");

    $.ajax({
      method: "POST",
      url: "/notes/" + thisId,
      data: {
        body: $("#bodyinput" + thisId).val()
      }
    }).done(function(data) {
        console.log(data);
      });
    $("#bodyinput" + thisId).val("");
  });

  $(document).on("click", "#add", function() {
    var thisId = $(this).attr("data-id");
    
    $.ajax({
      method: "GET",
      url: "/notes/" + thisId
    }).done(function(data) {
        console.log(data.note);
        $("#notes" + thisId).text(data.note.body)
      });
  });