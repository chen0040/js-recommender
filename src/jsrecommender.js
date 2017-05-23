var jsrecommender = jsrecommender || {};

(function(jss){
    var Table = function() {
        this.rowNames = [];
        this.columnNames = [];
        this.cells = {};
        this.cellCount = 0;
    };
    
    Table.prototype.cellKey = function(rowName, colName) {
        return rowName + '-' + colName;  
    };
    
    Table.prototype.addRowIfNotExists = function(rowName) {
        for(var i = 0; i < this.rowNames.length; ++i) {
            if(this.rowNames[i] == rowName) {
                return;
            }
        }  
        this.rowNames.push(rowName);
    };
    
    Table.prototype.addColumnIfNotExists = function(colName) {
        for(var i = 0; i < this.columnNames.length; ++i) {
            if(this.columnNames[i] == colName) {
                return;
            }
        }
        this.columnNames.push(colName);
    }
    
    Table.prototype.setCell = function(rowName, colName, value) {
        var key = this.cellKey(rowName, colName);
        var exists = this.containsCell(rowName, colName);
        this.cells[key] = value;
        if(!exists) {
            this.cellCount++;
            this.addRowIfNotExists(rowName);
            this.addColumnIfNotExists(colName);
        }
    };
    
    Table.prototype.containsCell = function(rowName, colName) {
        var key = this.cellKey(rowName, colName);
        return key in this.cells;
    };
    
    Table.prototype.removeCell = function(rowName, colName) {
        var exists = this.containsCell(rowName, colName);
        if(exists){
            this.cellCount--;
            delete this.cells[this.cellKey(rowName, colName)];
        }
    };
    
    jss.Table = Table;
    
	var Recommender = function(table){
        
    }

    jss.Recommender = Recommender;

})(jsrecommender);

if(module) {
	module.exports = jsrecommender;
}