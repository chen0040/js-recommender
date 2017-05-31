var jsrecommender = jsrecommender || {};

(function (jss) {
    
    jss.copyArray = function(a) {
        var b = [];
        for (var i = 0; i < a.length; ++i) {
            b.push(a[i]);
        }
        return b;
    };
    
    jss.copyMap = function(a) { 
        var b = {};
        for (var key in a) {
            b[key] = a[key];
        }
        return b;
    };
    
    var Table = function() {
        this.rowNames = [];
        this.columnNames = [];
        this.cells = {};
        this.cellCount = 0;
    };
    
    Table.prototype.cellKey = function (rowName, colName) {
        var rowName = rowName.replace("-", "");
        var colName = colName.replace("-", "");
        return rowName + '-' + colName;  
    };
    
    Table.prototype.getNames = function(cellKey) {
        var names = cellKey.split('-');
        return {
            rowName: names[0],
            colName: names[1]
        };
    }
    
    Table.prototype.addRowIfNotExists = function (rowName) {
        for (var i = 0; i < this.rowNames.length; ++i) {
            if (this.rowNames[i] == rowName) {
                return;
            }
        }  
        this.rowNames.push(rowName);
    };
    
    Table.prototype.addColumnIfNotExists = function(colName) {
        for (var i = 0; i < this.columnNames.length; ++i) {
            if(this.columnNames[i] == colName) {
                return;
            }
        }
        this.columnNames.push(colName);
    }
    
    Table.prototype.setCell = function (rowName, colName, value) {
        var rowName = rowName.replace("-", "");
        var colName = colName.replace("-", "");
        
        var key = this.cellKey(rowName, colName);
        var exists = this.containsCell(rowName, colName);
        this.cells[key] = value;
        if (!exists) {
            this.cellCount++;
            this.addRowIfNotExists(rowName);
            this.addColumnIfNotExists(colName);
        }
    };
    
    Table.prototype.getCell = function (rowName, colName) {
        var key = this.cellKey(rowName, colName);
        return this.cells[key];
    }
    
    Table.prototype.containsCell = function (rowName, colName) {
        var key = this.cellKey(rowName, colName);
        return key in this.cells;
    };
    
    Table.prototype.removeCell = function (rowName, colName) {
        var exists = this.containsCell(rowName, colName);
        if (exists){
            this.cellCount--;
            delete this.cells[this.cellKey(rowName, colName)];
        }
    };
    
    Table.prototype.makeCopy = function() {
        var clone = new Table();
        clone.rowNames = jss.copyArray(this.rowNames);
        clone.columnNames = jss.copyArray(this.columnNames);
        clone.cellCount = this.cellCount;
        clone.cells = jss.copyMap(this.cells);
        return clone;
    }
    
    jss.Table = Table;
    
	var Recommender = function(config){
        var config = config || {};
        if (!config.kDim) {
            config.kDim = 2;
        }
        if (!config.alpha) {
            config.alpha = 0.01;
        }
        if (!config.lambda) {
            config.lambda = 0.0;
        }
        if (!config.iterations) {
            config.iterations = 500;
        }
        
        this.kDim = config.kDim;
        this.alpha = config.alpha;
        this.lambda = config.lambda;
        this.iterations = config.iterations;
    };
    
    Recommender.prototype.fit = function(table) {
        this.theta = {};
        this.X = {};
        this.columnNames = table.columnNames;
        this.rowNames = table.rowNames;
        
        for (var d = 0; d < this.columnNames.length; ++d) {
            var x = [];
            for (var k = 0; k < this.kDim; ++k) {
                x.push(Math.random());    
            }
            this.theta[this.columnNames[d]] = x;
        }  
        
        
        for (var d = 0; d < this.rowNames.length; ++d) {
            var t = [];
            for (var k = 0; k < this.kDim; ++k) {
                t.push(Math.random());    
            }
            this.X[this.rowNames[d]] = t;
        }  
        
        for (var iter = 0; iter < this.iterations; ++iter) {
            var Vtheta = this.gradTheta(table, this.theta, this.X);
            for (var d = 0; d < this.columnNames.length; ++d) {
                var colName = this.columnNames[d];
                for (var k = 0; k < this.kDim; ++k) {
                    
                    this.theta[colName][k] = this.theta[colName][k] - this.alpha * Vtheta[colName][k];
                    
                }
            }
            
            var Vx = this.gradX(table, this.theta, this.X);
            for (var d = 0; d < this.rowNames.length; ++d) {
                var rowName = this.rowNames[d];
                for (var k = 0; k < this.kDim; ++k) {
                    this.X[rowName][k] = this.X[rowName][k] - this.alpha * Vx[rowName][k];
                }
            }
        }
        
        return {
            theta: this.theta,
            X: this.X,
            rowNames: this.rowNames,
            columnNames: this.columnNames,
            config: {
                alpha: this.alpha,
                lambda: this.lambda,
                iterations: this.iterations 
            }
        }
    };
    
    Recommender.prototype.gradTheta = function(table, theta, X) {
        
        var Vtheta = {};
        for (var d = 0; d < this.columnNames.length; ++d) {
            var colName = this.columnNames[d];
            var v = [];
            for (var k = 0; k < this.kDim; ++k) {
                var sum = 0;
                for (var cellKey in table.cells) {
                    var names = table.getNames(cellKey);
                    var colName2 = names.colName;
                    var rowName = names.rowName;
                    
                    if(colName != colName2) {
                        continue;
                    }
                    
                    var y = table.cells[cellKey];
                    var predicted = this.h(theta, X, rowName, colName);
                    
                    var x_i_k = X[rowName][k];
                    
                    sum += (predicted - y) * x_i_k;
                }
                
                sum += this.lambda * theta[colName][k];
                
                v.push(sum);
            }
            Vtheta[colName] = v;
        }
        return Vtheta;
    };
    
    Recommender.prototype.gradX = function(table, theta, X) {
        var Vx = {};
        for (var d = 0; d < this.rowNames.length; ++d) {
            var rowName = this.rowNames[d];
            var v = [];
            for (var k = 0; k < this.kDim; ++k) {
                var sum = 0;
                for (var cellKey in table.cells) {
                    var names = table.getNames(cellKey);
                    var colName = names.colName;
                    var rowName2 = names.rowName;
                    
                    if(rowName != rowName2) {
                        continue;
                    }
                    
                    var y = table.cells[cellKey];
                    
                    
                    var predicted = this.h(theta, X, rowName, colName);
                    
                    
                    sum += (predicted - y) * theta[colName][k];
                }
                
                sum += this.lambda * X[rowName][k];
                
                v.push(sum);
            }
            Vx[rowName] = v;
        }
        return Vx;
    };
    
    Recommender.prototype.h = function(theta, X, rowName, colName) {
        var sum = 0;
        for (var k = 0; k < this.kDim; ++k) {
            sum += theta[colName][k] * X[rowName][k];
        }  
        return sum;
    };
    
    Recommender.prototype.transform = function(table) {
        var table = table.makeCopy();
        for(var i = 0; i < table.rowNames.length; ++i) {
            var rowName = table.rowNames[i];
            for (var j = 0; j < table.columnNames.length; ++j) {
                var colName = table.columnNames[j];
                var predicted = this.h(this.theta, this.X, rowName, colName);
                table.setCell(rowName, colName, predicted);
            }
        }
        return table;
    };
    
    Recommender.prototype.fitAndTransform = function(table){
        this.fit(table);
        return this.transform(table);
    };
    

    jss.Recommender = Recommender;

})(jsrecommender);

var module = module || {};
if(module) {
	module.exports = jsrecommender;
}