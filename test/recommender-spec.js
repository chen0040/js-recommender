var expect    = require("chai").expect;
var jsrecommender = require("../src/jsrecommender");

describe("Recommender test", function() {
  describe("Test recommendation given some known review data", function() {
    var recommender = new jsrecommender.Recommender();
      
    var table = new jsrecommender.Table();
    
      // table.setCell('[movie-name]', '[user]', [score]);
    table.setCell('Love at last', 'Alice', 5);
    table.setCell('Remance forever', 'Alice', 5);
    table.setCell('Nonstop car chases', 'Alice', 0);
    table.setCell('Sword vs. karate', 'Alice', 0);
    table.setCell('Love at last', 'Bob', 5);
    table.setCell('Cute puppies of love', 'Bob', 4);
    table.setCell('Nonstop car chases', 'Bob', 0);
    table.setCell('Sword vs. karate', 'Bob', 0);
    table.setCell('Love at last', 'Carol', 0);
    table.setCell('Cute puppies of love', 'Carol', 0);
    table.setCell('Nonstop car chases', 'Carol', 5);
    table.setCell('Sword vs. karate', 'Carol', 5);
    table.setCell('Love at last', 'Dave', 0);
    table.setCell('Remance forever', 'Dave', 0);
    table.setCell('Nonstop car chases', 'Dave', 4);
      
    var model = recommender.fit(table);
    console.log(model);
      
    predicted_table = recommender.transform(table);
      
    console.log(predicted_table);
      
    it("has 4 users", function() {
    	expect(table.columnNames.length).to.equal(4);
    });
    it("has 5 movies", function() {
    	expect(table.rowNames.length).to.equal(5);
    });
      
    it('Predict correct value in the missing cells', function(){
        for (var i = 0; i < predicted_table.columnNames.length; ++i) {
            var user = predicted_table.columnNames[i];
            console.log('For user: ' + user);
            for (var j = 0; j < predicted_table.rowNames.length; ++j) {
                var movie = predicted_table.rowNames[j];
                console.log('Movie [' + movie + '] has actual rating of ' + Math.round(table.getCell(movie, user)));
                console.log('Movie [' + movie + '] is predicted to have rating ' + Math.round(predicted_table.getCell(movie, user)));
            }
        }
    });
  });


});