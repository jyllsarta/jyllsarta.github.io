function object_array_sort(data,key,order){
    var num_a = -1;
    var num_b = 1;
    if(order === 'asc'){
        num_a = 1;
        num_b = -1;
    }
    data = data.sort(function(a, b){
        var x = a[key];
        var y = b[key];
        if (x > y) return num_a;
        if (x < y) return num_b;
        return 0;
    });
}