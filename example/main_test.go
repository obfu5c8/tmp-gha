package main

import (
	"fmt"
	"testing"
)

func TestMain(t *testing.T) {

}

func Test_SomethingElse(t *testing.T) {

	t.Fatalf("%s", fmt.Errorf("Something went wrong"))
}

func Test_Nested(t *testing.T) {

	t.Run("nested test 1", func(t *testing.T) {
		main()
	})

	t.Run("nested test 2", func(t *testing.T) {
		t.Fatalf("%s", fmt.Errorf("Something else hapenned"))
	})
}

func Test_Skipping(t *testing.T) {
	t.Skip("Skipping this one!")
}
