using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BallDispenser : MonoBehaviour {
	//private GameObject[] ballz = new GameObject[12];
	public GameObject ball;
	// Use this for initialization
	void Awake () {
		Instantiate (ball);
	}
	
	// Update is called once per frame
	void Update () {
		if (GameObject.Find("BallPrefab(Clone)") == null) {
			Instantiate (ball);
		}
	}
}
