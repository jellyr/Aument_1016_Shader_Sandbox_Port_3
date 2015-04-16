#ifdef GL_ES
precision highp float;
#endif

// dashxdr pulled this shader from this page:
// http://wakaba.c3.cx/w/puls.html
// changed size -> resolution and that's pretty much it...

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

const float BLOWUP=86.0; /* 86.0 */
const float MAXSTEPSHIFT=8.0; /* 6.0 */
const int MAXITERS=34; /* 50 */

const float pi=3.1415926535;

float sum(vec3 v) { return v.x+v.y+v.z; }

int func(vec3 pos,float stepshift)
{
	vec3 v2=abs(fract(pos)-vec3(0.5,0.5,0.5))/2.0;
	float r=0.0769*sin(time*30.0*-0.0708);
	float blowup=BLOWUP/pow(2.0,stepshift+8.0);

	if(sum(v2)-0.1445+r<blowup) return 1;
	v2=vec3(0.25,0.25,0.25)-v2;
	if(sum(v2)-0.1445-r<blowup) return 2;

	int hue;
	float width;
	if(abs(sum(v2)-3.0*r-0.375)<0.03846+blowup)
	{
		width=0.1445;
		hue=4;
	}
	else
	{
		width=0.0676;
		hue=3;
	}

	if(sum(abs(v2.zxy-v2.xyz))-width<blowup) return hue;

	return 0;
}

void main()
{
	float x=0.5*(2.0*gl_FragCoord.x-resolution.x)/max(resolution.x,resolution.y);
	float y=0.5*(2.0*gl_FragCoord.y-resolution.y)/max(resolution.x,resolution.y);

	float sin_a=sin(time*30.0*0.00564);
	float cos_a=cos(time*30.0*0.00564);

	vec3 dir=vec3(x,-y,0.33594-x*x-y*y);
	dir=vec3(dir.y,dir.z*cos_a-dir.x*sin_a,dir.x*cos_a+dir.z*sin_a);
	dir=vec3(dir.y,dir.z*cos_a-dir.x*sin_a,dir.x*cos_a+dir.z*sin_a);
	dir=vec3(dir.y,dir.z*cos_a-dir.x*sin_a,dir.x*cos_a+dir.z*sin_a);

	vec3 pos=vec3(0.5,1.1875,0.875)+vec3(1.0,1.0,1.0)*0.0134*30.0*time;

	float stepshift=MAXSTEPSHIFT;

	if(fract(pow(x,y)*time*30.0*1000.0)>0.5) pos+=dir/pow(2.0,stepshift);
	else pos-=dir/pow(2.0,stepshift);

	int i=0;
	int c;

	for(int j=0;j<100;j++)
	{
		c=func(pos,stepshift);
		if(c>0)
		{
			stepshift+=1.0;
			pos-=dir/pow(2.0,stepshift);
		}
		else
		{
			if(stepshift>0.0) stepshift-=1.0;
			pos+=dir/pow(2.0,stepshift);
			i++;
		}

		if(stepshift>=MAXSTEPSHIFT) break;
		if(i>=MAXITERS) break;
	}

	vec3 col;
	if(c==0) col=vec3(0.0,0.0,0.0);
	else if(c==1) col=vec3(1.0,0.5,0.0);
	else if(c==2) col=vec3(0.0,1.0,0.0);
	else if(c==3) col=vec3(1.0,1.0,1.0);
	else if(c==4) col=vec3(0.5,0.5,0.5);

	float k=1.0-(float(i)-stepshift)/32.0;
	gl_FragColor=vec4(col*vec3(k*k,k*k,k*k*k),1.0);
}