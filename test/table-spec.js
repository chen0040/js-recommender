var expect    = require("chai").expect;
var jsrecommender = require("../src/jsrecommender");

describe("Table api test", function() {
  describe("Create and add values to table", function() {
    var table = new jsrecommender.Table();
    table.setCell('movie1', 'user1', 5);
    table.setCell('movie2', 'user1', 4.5);
    table.setCell('movie1', 'user2', 3.0);
      
    it("has two columns", function() {
    	expect(table.columnNames.length).to.equal(2);
        expect(table.columnNames[0]).to.equal('user1');
        expect(table.columnNames[1]).to.equal('user2');
    });
    it("has two rows", function() {
    	expect(table.rowNames.length).to.equal(2);
        expect(table.rowNames[0]).to.equal('movie1');
        expect(table.rowNames[1]).to.equal('movie2');
    });
    it('has correct value in the cells', function(){
        expect(table.getCell('movie1', 'user1')).to.equal(5);
        expect(table.getCell('movie2', 'user1')).to.equal(4.5);
        expect(table.getCell('movie1', 'user2')).to.equal(3);
    });
  });


});