// Sea Noise
// By @paulofalcao
// Simple raymarching sandbox with camera

// Raymarching Distance Fields
// About http://www.iquilezles.org/www/articles/raymarchingdf/raymarchingdf.htm
// Also known as Sphere Tracing
// ******** Ashima Noise3D Start https://github.com/ashima/webgl-noise/blob/master/src/noise3D.glsl

uniform vec2 resolution;
uniform float time;
uniform vec2 mouse;

float PI=3.14159265;

vec3 mod289(vec3 x){
	return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x){
	return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
	return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r){
	return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v){
	const vec2  C = vec2(1.0 / 6.0, 1.0 / 3.0);
	const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

	vec3 i  = floor(v + dot(v, C.yyy) );
	vec3 x0 =   v - i + dot(i, C.xxx);

	vec3 g = step(x0.yzx, x0.xyz);
	vec3 l = 1.0 - g;
	vec3 i1 = min( g.xyz, l.zxy );
	vec3 i2 = max( g.xyz, l.zxy );

	vec3 x1 = x0 - i1 + C.xxx;
	vec3 x2 = x0 - i2 + C.yyy;
	vec3 x3 = x0 - D.yyy;

	i = mod289(i);

	vec4 p = permute( permute( permute(
									i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
						   + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
				  + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

	float n_ = 0.142857142857;
	vec3  ns = n_ * D.wyz - D.xzx;

	vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

	vec4 x_ = floor(j * ns.z);
	vec4 y_ = floor(j - 7.0 * x_ );

	vec4 x = x_ *ns.x + ns.yyyy;
	vec4 y = y_ *ns.x + ns.yyyy;
	vec4 h = 1.0 - abs(x) - abs(y);

	vec4 b0 = vec4( x.xy, y.xy );
	vec4 b1 = vec4( x.zw, y.zw );

	vec4 s0 = floor(b0)*2.0 + 1.0;
	vec4 s1 = floor(b1)*2.0 + 1.0;
	vec4 sh = -step(h, vec4(0.0));

	vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy ;
	vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww ;

	vec3 p0 = vec3(a0.xy , h.x);
	vec3 p1 = vec3(a0.zw , h.y);
	vec3 p2 = vec3(a1.xy , h.z);
	vec3 p3 = vec3(a1.zw , h.w);

	vec4 norm = taylorInvSqrt( vec4( dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3) ) );

	p0 *= norm.x;
	p1 *= norm.y;
	p2 *= norm.z;
	p3 *= norm.w;

	vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
	m = m * m;
	return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

float obj(in vec3 p){
	float d=p.y;
	p.y=p.y+time;
	if (d<0.2)
		d=d-snoise(vec3(p*2.0))*0.15+0.05;
	return d;
}

vec3 obj_c(in vec3 p){
	p.y = p.y+time;
	float c = snoise(vec3(p*2.0))*0.5+0.5;
	c=c*c*(3.0-2.0*c);
	vec3 c3=mix(vec3(0,0.5,1),vec3(1,0,0),c);
	return c3;
}

void main(void){
	vec2 vPos = gl_FragCoord.xy / resolution.xy;
	vPos.y = 1.0 - vPos.y;
	vPos = -1.0 + 2.0 * vPos;

	vec3 vuv = vec3(0,1,sin(time*.23)*0.2);
	vec3 prp = vec3(sin(time*.53)*4.0,2,cos(time*.39)*4.0);
	vec3 vrp = prp - vec3(cos(time*.42)*0.5,1.0,sin(time*.34)*0.5);

	vec3 vpn = normalize(vrp-prp);
	vec3 u = normalize(cross(vuv,vpn));
	vec3 v = cross(vpn,u);
	vec3 vcv = (prp+vpn);
	vec3 scrCoord = vcv + vPos.x * u * resolution.x / resolution.y + vPos.y * v;
	vec3 scp = normalize(scrCoord-prp);

	const vec3 e=vec3(0.1,0,0);
	const float maxd=15.0;
	float s = 0.1;

	vec3 c;
	vec3 p;
	vec3 n;

	float f = -prp.y / scp.y;

	if (f>0.0) p = prp + scp * f;
	else f = maxd;

	for(int i=0;i<4;i++){
		f += s;
		p=prp+scp*f;
		s=obj(p);
	}

	 if (f<maxd){
		 c=obj_c(p);
		 n=normalize( vec3(s-obj(p-e.xyy),s-obj(p-e.yxy),s-obj(p-e.yyx) ) );
		 float b = dot(n,normalize(prp-p));
		 gl_FragColor= vec4((b*c+pow(b,16.0))*(1.0-f*.06),1.0);
	 } else {
		 gl_FragColor=vec4(0,0,0,1);
	}
}
