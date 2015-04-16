#ifdef GL_ES
precision highp float;
#endif

uniform vec2 resolution;
uniform float time;

float stime=sin(time);
float ctime=cos(time);

float inObj(in vec3 p){
	float oP=length(p);
	p.x=sin(p.x)+stime;
	p.z=sin(p.z)+ctime;
	return float(min(length(p)-4.5-sin(oP-time*3.0),p.y+3.0));
}

void main(void){
	vec2 vPos=-1.0+2.0*gl_FragCoord.xy/resolution.xy;

	vec3 vuv=vec3(stime,1,0);
	vec3 vrp=vec3(sin(time),0,cos(time));
//	vec3 prp=vec3(sin(time*0.7)*20.0+vrp.x+20.0, stime*4.0+4.0+vrp.y+3.0, cos(time*0.6)*20.0+vrp.z+14.0);
	vec3 prp=vec3(vrp.x+33.0,vrp.y+45.0,vrp.z+0.0);
	
	vec3 vpn=normalize(vrp-prp);
	vec3 u=normalize(cross(vuv,vpn));
	vec3 v=cross(vpn,u);
	vec3 vcv=(prp+vpn);
	vec3 scrCoord=vcv+vPos.x*u*resolution.x/resolution.y+vPos.y*v;
	vec3 scp=normalize(scrCoord-prp);

	const vec3 e = vec3(0.1,0,0);
	const float maxd=200.0;

	float s=0.1;
	vec3 c,p,n;

	float f=-(prp.y-2.5)/scp.y;
	if (f>0.0) p=prp+scp*f;
	else f=maxd;

	for(int i=0;i<56;i++){
		if (abs(s)<.01||f>maxd) break;
		f+=s;
		p=prp+scp*f;
		s=inObj(p);
	}

	if (f<maxd){
		if(p.y<-2.5){
			c=vec3(0,0,0);
			n=vec3(0,0,0);
		}
		else{
			float d=length(p);
			c=vec3((sin(d-time*12.0)+1.0)/4.0,
				   (sin(d-time*10.0)+1.0)/4.0,
				   (sin(d-time*14.0)+1.0)/2.0);
			n=normalize(
						vec3(s-inObj(p-e.xyy),
							 s-inObj(p-e.yxy),
							 s-inObj(p-e.yyx)));
		}
		float b=dot(n,normalize(prp-p));
		gl_FragColor=vec4((b*c+pow(b,54.0))*(1.0-f*.005),1.0);
	}
	else gl_FragColor=vec4(0,0,0,1);
}
