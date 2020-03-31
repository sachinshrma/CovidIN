var url='https://api.covid19india.org/data.json'
var districtUrl='https://api.covid19india.org/state_district_wise.json'
var newsUrl='https://newsapi.org/v2/top-headlines?country=in&apiKey=49f0129072c949e4b1af5abe79a831e2'
var apiData=[]
var disData=[]
var newsData=[]
var currIndex=0;

function format ( d ) {
    var dist=disData[d[0]]['districtData']
    let childTable='<table cellpadding="0" class="dis-table" cellspacing="0" border="0" style="padding-left:50px;">'
                    +'<thead><tr><th class="text-left">District</th><th class="text-right">Confirmed</th></tr></thead><tbody>'
    Object.keys(dist).forEach(function(districtName){
        var element='<tr><td class="text-left">'+ districtName
                    +'</td><td class="text-right">'+dist[districtName]['confirmed']
                    +'</td></tr>'
        childTable+=element          
        }
    )
    return childTable+'</tbody></table>';
}

function createTotalCount(){
    $('.confirmed-count').text(apiData['statewise'][0]['confirmed'])
    $('.active-count').text(apiData['statewise'][0]['active'])
    $('.deaths-count').text(apiData['statewise'][0]['deaths'])
    $('.recovered-count').text(apiData['statewise'][0]['recovered'])
    $('.lastupdatedtime').text(apiData['statewise'][0]['lastupdatedtime'])

    $('.confirmed-delta').text('+'+apiData['key_values'][0]['confirmeddelta'])
    let activecount=parseInt(apiData['key_values'][0]['confirmeddelta'])-(parseInt(apiData['key_values'][0]['deceaseddelta'])
                    +parseInt(apiData['key_values'][0]['recovereddelta']))
                    
    if(activecount>=0)
        $('.active-delta').text('+'+activecount)
    else
        $('.active-delta').text('-'+activecount)
    $('.deaths-delta').text('+'+apiData['key_values'][0]['deceaseddelta'])
    $('.recovered-delta').text('+'+apiData['key_values'][0]['recovereddelta'])
}

function createStatewiseTable(){
    var delta=''
    for(let i=1;i<apiData['statewise'].length;++i){
        if(apiData['statewise'][i]['confirmed']==0)
            break
            if(apiData['statewise'][i]['delta']['confirmed']!=0) 
                delta='<span class="text-danger">+'+apiData['statewise'][i]['delta']['confirmed']+' </span>'
            else 
                delta=''
        var element='<a href=""><tr class="state-tr"><td class="text-left details-control">'+ apiData['statewise'][i]['state']
                    +'</td>'+'<td class="text-right details-control">'+apiData['statewise'][i]['confirmed']
                    +'</td><td class="text-right details-control">'+apiData['statewise'][i]['active']
                    +'</td><td class="text-right details-control">'+apiData['statewise'][i]['deaths']
                    +'</td><td class="text-right details-control">'+apiData['statewise'][i]['recovered']+'</tr></a>'
        $('.state-table-body').append(element)
      
    }

    var table = $('.state-table').DataTable({     
        paging: false,
        "order": [[ 1, "desc" ]],
        "info":     false
    });

    $('input[type="search"]').addClass('form-control')
    $('.state-table-body').on('click', 'td.details-control',  function () {
        var tr = $(this).closest('tr');
        var row = table.row(tr);
        if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row
            row.child( format(row.data()) ).show();
            tr.addClass('shown');
        }
    } );
}

function populateNews(flag){
    if(flag==1){
        if(currIndex==newsData.length) return
        $('.news-elements').html('')
        let i=currIndex
        for(;i<currIndex+3 && newsData.length;++i){
            let imageurl=newsData[i]['urlToImage']
            let title=newsData[i]['title']
            let sourec=newsData[i]['source']['name']

            let newElement='<div class="news-card">'
                            +'<div class="news-image"><img height="120px" width="130px" src="'+imageurl+'" alt="" srcset=""></div>'
                            +'<div class="news-content">'
                            +'<div class="news-title">'+title+'</div>'
                            +'<div class="news-source text-muted">'+sourec+'</div>'
                            +'</div> </div><hr>'

            $('.news-elements').append(newElement)    
        }
        currIndex=i  
        
    }else if(flag==0){
        if(currIndex==3) return
        $('.news-elements').html('')
        let i=currIndex-6
        for(;i<currIndex-3 && newsData.length;++i){
            let imageurl=newsData[i]['urlToImage']
            let title=newsData[i]['title']
            let sourec=newsData[i]['source']['name']

            let newElement='<div class="news-card">'
                            +'<div class="news-image"><img height="120px" width="130px" src="'+imageurl+'" alt="" srcset=""></div>'
                            +'<div class="news-content">'
                            +'<div class="news-title">'+title+'</div>'
                            +'<div class="news-source text-muted">'+sourec+'</div>'
                            +'</div> </div><hr>'
            $('.news-elements').append(newElement)
        }
        currIndex=i  
    }
    if(currIndex==newsData.length)
        $('.next-btn').addClass('disabled') 
    else
        $('.next-btn').removeClass('disabled') 

    if(currIndex==3)
        $('.previous-btn').addClass('disabled')
    else
        $('.previous-btn').removeClass('disabled')
}

function historyChart() {
    var rows=[]
    for(let i=0;i<apiData['cases_time_series'].length;++i){
        rows.push([new Date(apiData['cases_time_series'][i]['date']+' 2020'),parseInt(apiData['cases_time_series'][i]['totalconfirmed'])
        ,parseInt(apiData['cases_time_series'][i]['totaldeceased']),parseInt(apiData['cases_time_series'][i]['totalrecovered'])])
    }
    
    var data = new google.visualization.DataTable();
    data.addColumn('date', 'Date');
    data.addColumn('number', 'C');
    data.addColumn('number', 'D');
    data.addColumn('number', 'R');

    data.addRows(rows);

    var options = {
        displayAnnotations: true,
        displayZoomButtons:false,
        legend:{position:'none'},
    chart: {
        title: 'Covid trend in india',
    },
    width: 330,
    height: 200
    };

    var chart = new google.visualization.AnnotatedTimeLine(document.getElementById('linechart'));
    chart.draw(data, options);

}

$(document).ready( function () {
    
    fetch(url)
    .then(response=>{
        return response.json()
    }).then(result=>{
        apiData=result
        fetch(districtUrl)
        .then(response2=>{
            return response2.json()
        })
        .then(result2=>{
            disData=result2
            
            createTotalCount()
            createStatewiseTable()

            google.charts.load('current', {'packages':['annotatedtimeline']});
            google.charts.setOnLoadCallback(historyChart);
        })    
    })  
    

    fetch(newsUrl)
    .then(response=>{
        return response.json()
    }).then(result=>{
        newsData=result['articles'];
        newsData=newsData.slice(0,newsData.length-(newsData.length%3))
        populateNews(1)
    })

    $('.previous-btn').click(function(){ 
        $('html, body').animate({
            scrollTop: $(".news-container").offset().top
        }, 200);
        populateNews(0)
    })

    $('.next-btn').click( function(){
        $('html, body').animate({
            scrollTop: $('.news-container').offset().top
        }, 200);
        populateNews(1)
    })

})
