using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class PlayerMovement : MonoBehaviour {
	public float speed;
	private Rigidbody rb;
	private int score;
	private int winPoints = 10;
	public Text scoreText;
	public bool usingController;
	bool canMove;

	// Use this for initialization
	void Awake () {
		rb = GetComponent<Rigidbody> ();
		score = 0;
		setScore (0);
		canMove = true;
		speed = 55;
		//set these here just in case someone forgot to do something in the GUI
		rb.drag = 10;
		rb.mass = 500;
		rb.isKinematic = false;
		scoreText.resizeTextMaxSize = 1;
	}

	void Update() {
		if (score > winPoints)
			WinnerMode ();
	}

	// Update is called once per frame
	void FixedUpdate () {
		movement ();
	}

	void movement() {
		float horizontal;
		if (usingController)
			horizontal = Input.GetAxis (this.gameObject.name + "Strafe-Controller");
		else
			horizontal = Input.GetAxis (this.gameObject.name + "Strafe");
		if (Mathf.Abs(horizontal) > 0.1 && canMove)
			rb.position += (this.transform.right * horizontal * speed * Time.deltaTime);

		if(Input.GetButtonDown(this.gameObject.name + "Push") && canMove)
		{
			canMove = false;
			StartCoroutine(push());
		}
	}



	void OnTriggerEnter(Collider col) {
		rb.position += (this.transform.forward * 1);
	}

	IEnumerator push()
	{
		int force  = 30000;
		rb.velocity = Vector3.zero;
		Vector3 initialPos = rb.position;
		Vector3 newPos = transform.forward;
		
		rb.AddForce(newPos.x * force, 0 , newPos.z * force, ForceMode.Impulse);
		yield return new WaitForSeconds(0.3f);
		force += 1000;
		rb.AddForce(newPos.x * force *-1 , 0, newPos.z * force * -1 , ForceMode.Impulse);
		yield return new WaitForSeconds(0.3f);
		rb.velocity = Vector3.zero;
		rb.position = initialPos;
		canMove = true;
	}

	public void setScore(int val) {
		if (val < 0)
			val = 0;
		score = val;
		scoreText.text = "Score : " + score.ToString ();
	}

	public int getScore() {
		return score;
	}

	public void WinnerMode() {
		Color winColor = Random.ColorHSV (0f, 1f, 1f, 1f, 0.5f, 1f);
		RectTransform textRect = scoreText.GetComponent<RectTransform> ();
		GameObject floor = GameObject.Find ("Floor");
		GetComponent<Renderer>().material.color = winColor;
		floor.GetComponent<Renderer> ().material.color = winColor;
		scoreText.color = winColor;
		scoreText.text = this.gameObject.name + " is winner !!!";
		//textRect.anchoredPosition = new Vector3 (0,0,0);
		textRect.anchoredPosition = rb.position;
		scoreText.fontSize = 100;
	}
}
