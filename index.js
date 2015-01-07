module.exports={name:"console", "triggers":[{name:"on data",fields:[{name:"tty", displayName:"Which input should be watched"}], when:function(fields,callback){
	$('fs').createReadStream(fields.tty).on('data', function(data){
			callback({data:data})
		});
	}
}], "actions":[{name:"log on console", fields:[{ name:"message", displayName:"What's Happening ?"}], delegate:function(fields){
        var result= function(fields){
                console.log(fields.message);
        };
        result.fields=fields;
        return result;
}}, {name:"run", fields:[{ name:"command", displayName:"Commande"}, { name:"host", displayName:"Hôte"}, { name:"user", displayName:"Utilisateur"}], delegate:function(fields){
        var result= function(fields, trigger, complete){
            if(fields.host)
                fields.command='ssh '+fields.user+'@'+fields.host+' \''+fields.command.replace(/'/g, "'\"'\"'")+' \'';
            console.log(fields.command)
            $('child_process').exec(fields.command, [], {maxBuffer:1024*1024}, function(error,stdout,stderr)
            {
                console.log(stdout);
                if(error)
                    console.log(error);
            }).on('exit', function(){ complete(); });
        };
        result.fields=fields;
        return result;
}}, ]}