#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

// 2013-03-30 by @hintz

#define CGFloat float
#define M_PI 3.14159265359

vec3 hsvtorgb(float h, float s, float v)
{
	float c = v * s;
	h = mod((h * 6.0), 6.0);
	float x = c * (1.0 - abs(mod(h, 2.0) - 1.0));
	vec3 color;
 
	if (0.0 <= h && h < 1.0) 
	{
		color = vec3(c, x, 0.0);
	}
	else if (1.0 <= h && h < 2.0) 
	{
		color = vec3(x, c, 0.0);
	}
	else if (2.0 <= h && h < 3.0) 
	{
		color = vec3(0.0, c, x);
	}
	else if (3.0 <= h && h < 4.0) 
	{
		color = vec3(0.0, x, c);
	}
	else if (4.0 <= h && h < 5.0) 
	{
		color = vec3(x, 0.0, c);
	}
	else if (5.0 <= h && h < 6.0) 
	{
		color = vec3(c, 0.0, x);
	}
	else
	{
		color = vec3(0.0);
	}
 
	color += v - c;
 
	return color;
}

void main(void) 
{

	vec2 position = (gl_FragCoord.xy - 0.5 * resolution) / resolution.y;
	float x = position.x;
	float y = position.y;
	vec3 color = vec3(1.0);
	
	CGFloat a = atan(x, y);
    
    	CGFloat d = sqrt(x*x+y*y);
    	CGFloat d0 = 0.5*(sin(d-time)+1.5)*d;
  	#define n 3.0
	for (float i=1.0; i<n; i+=2.0)
	{
  	CGFloat d1 = 1.0 + float(i)*floor(d+1.0);
	
    	CGFloat u = mod(a*d1+sin(d1*10.0+time), M_PI*2.0)/M_PI*0.5 - 0.5;
    	CGFloat v = mod(pow(d0*4.0, 0.75),1.0) - 0.5;
    
    	CGFloat dd = sqrt(u*u+v*v);
    
    	CGFloat aa = atan(u, v);
    
    	CGFloat uu = mod(aa*30.0, M_PI*2.0)/M_PI*0.5 - 0.5;
    	CGFloat vv = mod(dd*4.0,1.0) - 0.5;
    
    	CGFloat d2 = sqrt(uu*uu+vv*vv)*1.5;
	
	
	color *= vec3(dd+time*0.5/d1, dd, d2);
	}
	
	color*=n;
	gl_FragColor = vec4( hsvtorgb(color.x, color.y, color.z), 1.0 );
}